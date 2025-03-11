// Based on lecture code: https://github.com/studBrage/Kryssplattform-HK-H24/blob/main/api/postApi.ts

import { PostData } from "@/utils/postData";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  QueryDocumentSnapshot,
  DocumentData,
  startAfter,
  limit,
  where,
  Timestamp,
} from "firebase/firestore";
import { db, getDownloadUrl } from "@/firebaseConfig";
import { uploadImageToFirebase } from "./imageApi";

export const createPost = async (post: PostData) => {
  try {
    const firebaseImage = await uploadImageToFirebase(post.imageURL);
    // Added timestamp to save the time the post gets created. Based on documentation from Firebase.
    // Timestamp in Firebase: https://firebase.google.com/docs/reference/js/v8/firebase.firestore.Timestamp#static-now
    const date = Timestamp.now();
    console.log("firebaseImage", firebaseImage);
    if (firebaseImage === "ERROR") {
      return;
    }
    const postImageDownloadUrl = await getDownloadUrl(firebaseImage);
    const postWithImageData: PostData = {
      ...post,
      imageURL: postImageDownloadUrl,
      date,
    };
    const docRef = await addDoc(collection(db, "posts"), postWithImageData);
    console.log("Document written with ID:", docRef.id);
  } catch (e) {
    console.log("Error adding document", e);
  }
};

export const getAllPosts = async () => {
  const queryResult = await getDocs(collection(db, "posts"));
  return queryResult.docs.map((doc) => {
    console.log(doc.data());
    return { ...doc.data(), id: doc.id } as PostData;
  });
};

export const getPostById = async (id: string) => {
  const specificPost = await getDoc(doc(db, "posts", id));
  console.log("post by spesific id", specificPost.data());
  return {
    ...specificPost.data(),
    id: specificPost.id,
  } as PostData;
};

// Added userId and postId to check is the current userId is the author of the post.
export const deletePost = async (userId: string, postId: string) => {
  try {
    const postRef = doc(db, "posts", postId);
    const postSnapshot = await getDoc(postRef);

    if (postSnapshot.exists()) {
      const postData = postSnapshot.data();
      // Checks if the authorId and userId match before allowing to delete the post.
      if (postData.authorId === userId) {
        await deleteDoc(postRef);
        console.log("Document successfully deleted!", postId);
      } else {
        console.log("User not authorized to delete this post");
      }
    } else {
      console.log("Post not found");
    }
  } catch (e) {
    console.error("Error removing document: ", e);
  }
};

export const getPostsByAuthor = async (author: string, byId: boolean = false) => {
  try {
    // Choose to query by author or authorId based on byId.
    // Added this to use the same function for retreiving posts by author (author name) for profilePage,
    // and by authorId for author modal in postDetails.
    const queryField = byId ? "authorId" : "author";
    const querySnapshot = await getDocs(
      query(collection(db, "posts"), where(queryField, "==", author))
    );
    return querySnapshot.docs.map((doc) => {
      console.log(doc.data());
      return { ...doc.data(), id: doc.id } as PostData;
    });
  } catch (error) {
    console.log("Error getting posts by author: ", error);
    return [];
  }
};

export const getPostsByCategory = async (category: string) => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, "posts"), where("category", "==", category))
    );
    return querySnapshot.docs.map((doc) => {
      console.log(doc.data());
      return { ...doc.data(), id: doc.id } as PostData;
    });
  } catch (error) {
    console.log("Error getting posts by cateogry: ", error);
    return [];
  }
};

export const toggleLikePost = async (id: string, userId: string) => {
  const postRef = doc(db, "posts", id);
  const post = await getDoc(postRef);

  if (post.data()?.likes) {
    const likes = post.data()!.likes;
    if (likes.includes(userId)) {
      await updateDoc(postRef, {
        likes: likes.filter((like: string) => like !== userId),
      });
    } else {
      console.log("adding like");
      await updateDoc(postRef, {
        likes: [...likes, userId],
      });
    }
  } else {
    await updateDoc(postRef, {
      likes: [userId],
    });
  }
};

export const toggleDislikePost = async (id: string, userId: string) => {
  const postRef = doc(db, "posts", id);
  const post = await getDoc(postRef);

  if (post.exists()) {
    const dislikes = post.data()?.dislikes || [];
    if (dislikes.includes(userId)) {
      await updateDoc(postRef, {
        dislikes: dislikes.filter((dislike: string) => dislike != userId),
      });
    } else {
      console.log("adding dislike");
      await updateDoc(postRef, {
        dislikes: [...dislikes, userId],
      });
    }
  } else {
    console.error("postApi: post not found");
  }
};

export const getSortedPosts = async (isRising: boolean) => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, "posts"),
        orderBy("title", isRising ? "asc" : "desc")
      )
    );
    return querySnapshot.docs.map((doc) => {
      console.log("sorted posts: ", doc.data());
      return { ...doc.data(), id: doc.id } as PostData;
    });
  
  } catch (error) {
    console.log("sort: Error getting sorted data: ", error);
    return [];
  }
};

export const getSearchedPosts = async (searchString: string) => {
  try {
    const endString = searchString + "\uf8ff";
    const querySnapshot = await getDocs(
      query(
        collection(db, "posts"),
        where("title", ">=", searchString),
        where("title", "<=", endString)
      )
    );
    return querySnapshot.docs.map((doc) => {
      console.log(doc.data());
      return { ...doc.data(), id: doc.id } as PostData;
    });
  } catch (error) {
    console.log("search: Error getting searched data: ", error);
    return [];
  }
};

export const getLocalSearchedPosts = async (searchString: string) => {
  const queryResult = await getDocs(collection(db, "posts"));
  return queryResult.docs
    .map((doc) => {
      console.log(doc.data());
      return { ...doc.data(), id: doc.id } as PostData;
    })
    .filter(
      (post) =>
        post.title &&
        post.title.toLowerCase().includes(searchString.toLowerCase())
    );
};

export const getPaginatedPosts = async (
  getFromDoc: QueryDocumentSnapshot<DocumentData, DocumentData> | null
) => {
  if (getFromDoc) {
    const next = query(
      collection(db, "posts"),
      orderBy("title", "desc"),
      startAfter(getFromDoc),
      limit(4)
    );
    const querySnapshots = await getDocs(next);

    const last = querySnapshots.docs[querySnapshots.docs.length - 1];
    const result = querySnapshots.docs.map((doc) => {
      console.log(doc.data());
      return { ...doc.data(), id: doc.id } as PostData;
    });
    return { result, last };
  }
  const first = query(
    collection(db, "posts"),
    orderBy("title", "desc"),
    limit(4)
  );
  const querySnapshots = await getDocs(first);

  const last = querySnapshots.docs[querySnapshots.docs.length - 1];
  const result = querySnapshots.docs.map((doc) => {
    console.log(doc.data());
    return { ...doc.data(), id: doc.id } as PostData;
  });
  return { result, last };
};
