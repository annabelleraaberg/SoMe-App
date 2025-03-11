import { useSession } from "@/providers/authctx";
import React, {
  createContext,
  useState,
  useRef,
  useEffect,
  useContext,
} from "react";
import { getData } from "@/utils/local_storage";
import { PostData } from "@/utils/postData";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import * as postApi from "@/api/postApi";

type PostContextProps = {
  posts: PostData[];
  getPostsFromBackend: () => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  isLoading: boolean;
};

const PostContext = createContext<PostContextProps | undefined>(undefined);

export function usePostContext() {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePostContext must be used within a PostProvider");
  }
  return context;
}

export function PostProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const { user } = useSession();

  /* PostContext made to fetch posts from backend and delete posts.
  It combines getPostsFromBackend and deletePost into the same context so they can be accessed 
  across different pages. This makes it possible to update immediately after deleteing a post. */
  const lastDocRef = useRef<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(null);

  const getPostsFromBackend = async () => {
    console.log("Get posts from backend...");
    setRefreshing(true);
    try {
      console.log("Backend");
      const { result: newPosts, last: lastDoc } =
        await postApi.getPaginatedPosts(lastDocRef.current);
      lastDocRef.current = lastDoc;
      // Filter out any posts that already exist in the current list.
      // Added to prevent duplicates
      setPosts((prevPosts) => {
        const uniquePosts = newPosts.filter(
          (post) =>
            !prevPosts.some((existingPost) => existingPost.id === post.id)
        );
        return [...prevPosts, ...uniquePosts];
      });
    } catch (error) {
      console.log("Local");
      console.log("Error fetching posts from backend: ", error);
      const localPosts = await getData("posts");
      if (localPosts) {
        setPosts(JSON.parse(localPosts));
      }
    } finally {
      setRefreshing(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!user) {
      console.log("User is not authenticated.");
      return;
    }
    setIsLoading(true);
    try {
      await postApi.deletePost(user.uid, id as string);
      console.log("deleteSuccess set to: ", deleteSuccess);
      setDeleteSuccess(true);
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
      console.log("deleteSuccess set to: ", deleteSuccess);
    } catch (error) {
      console.log("Error deleting post");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPostsFromBackend();
  }, []);

  return (
    <PostContext.Provider
      value={{ posts, getPostsFromBackend, deletePost, isLoading }}
    >
      {children}
    </PostContext.Provider>
  );
}
