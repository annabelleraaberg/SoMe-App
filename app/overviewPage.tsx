import { getData } from "@/utils/local_storage";
import { PostData } from "@/utils/postData";
import { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  FlatList,
  RefreshControl,
} from "react-native";
import * as postApi from "@/api/postApi";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { useRouter } from "expo-router";
import Spacer from "@/components/Spacer";
import Post from "@/components/Post";

export default function OverviewPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  const lastDocRef = useRef<QueryDocumentSnapshot<
    DocumentData,
    DocumentData
  > | null>(null);

  const getPostsFromBackend = async () => {
    console.log("Get posts from backend...");
    setRefreshing(true);
    try {
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
      setRefreshing(false);
    } catch (error) {
      console.log("Error fetching posts from backend: ", error);
      const localPosts = await getData("posts");
      if (localPosts) {
        setPosts(JSON.parse(localPosts));
      }
    }
  };

  useEffect(() => {
    getPostsFromBackend();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ width: 50 }} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Gallery Overview</Text>
          <Text>Want to see more? Log in!</Text>
        </View>
        <Pressable
          style={styles.authenticationButton}
          onPress={() => router.replace("/authentication")}
          accessibilityLabel="Log in"
          accessibilityHint="Navigates to the authentication page"
        >
          <Text style={styles.authenticationButtonText}>Log in</Text>
        </Pressable>
      </View>
      <FlatList
        data={posts}
        numColumns={2}
        ListHeaderComponent={() => <Spacer height={10} />}
        ListFooterComponent={() => <Spacer height={50} />}
        ItemSeparatorComponent={() => <Spacer height={8} />}
        onEndReached={() => getPostsFromBackend()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={getPostsFromBackend}
          />
        }
        renderItem={({ item }) => (
          <Post
            key={item.id}
            postData={item}
            toggleLike={(id) => {
              const tempPosts = posts.map((tempPost) => {
                if (tempPost.id === id) {
                  return { ...tempPost, isLiked: !tempPost.isLiked };
                }
                return tempPost;
              });
              setPosts(tempPosts);
            }}
            toggleDislike={(id) => {
              const tempPosts = posts.map((tempPost) => {
                if (tempPost.id === id) {
                  return { ...tempPost, isDisliked: !tempPost.isDisliked };
                }
                return tempPost;
              });
              setPosts(tempPosts);
            }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
  },
  header: {
    padding: 10,
    marginTop: 40,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-evenly",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerTextContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  authenticationButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    height: 50,
    borderRadius: 50,
    backgroundColor: "#AA0E4C",
    justifyContent: "center",
    alignItems: "center",
  },
  authenticationButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D3D3D3",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButton: {
    borderRadius: 50,
    backgroundColor: "#AA0E4C",
    padding: 10,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
  },
});
