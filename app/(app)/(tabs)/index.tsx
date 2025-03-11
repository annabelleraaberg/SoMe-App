// Based on lecture code: https://github.com/studBrage/Kryssplattform-HK-H24/blob/main/app/(app)/(tabs)/index.tsx

import { useSession } from "@/providers/authctx";
import { storeData } from "@/utils/local_storage";
import { PostData } from "@/utils/postData";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  FlatList,
  Modal,
  RefreshControl,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import PostForm from "@/components/PostForm";
import Spacer from "@/components/Spacer";
import Post from "@/components/Post";
import UpsertUser from "@/components/UpsertUser";
import { usePostContext } from "@/providers/PostContext";

export default function Index() {
  const [postsList, setPostsList] = useState<PostData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpsertUserModalOpen, setIsUpsertUserModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const { userNameSession } = useSession();
  const { posts, getPostsFromBackend } = usePostContext();

  console.log("userNameSession in index: ", userNameSession);

  useEffect(() => {
    getPostsFromBackend();
  }, []);

  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () =>
            userNameSession ? (
              <Pressable
                style={{ paddingRight: 6 }}
                onPress={() => setIsModalOpen(true)}
                accessibilityLabel="Open upload post form"
              >
                <Text>Upload</Text>
              </Pressable>
            ) : null,
          headerLeft: () => (
            <Pressable
              style={{ padding: 6 }}
              onPress={() => {
                if (!userNameSession) {
                  router.push("/authentication");
                }
              }}
            >
              <Text>
                {userNameSession ? (
                  userNameSession
                ) : (
                  <Text className="text-blue-700">Log in</Text>
                )}
              </Text>
            </Pressable>
          ),
        }}
      />
      <Modal visible={isUpsertUserModalOpen} animationType="slide">
        <UpsertUser
          closeModal={() => setIsUpsertUserModalOpen(false)}
          createUserName={async (name) => {
            try {
              await storeData("userNameSession", name);
              setUserName(name);
              setIsUpsertUserModalOpen(false);
            } catch (error) {
              console.log("Error creating username", error);
            }
          }}
        />
      </Modal>
      <Modal visible={isModalOpen} animationType="slide">
        <PostForm
          addNewPost={async () => {
            await getPostsFromBackend();
            setIsModalOpen(false);
          }}
          closeModal={() => setIsModalOpen(false)}
        />
      </Modal>

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
        renderItem={(post) => {
          return (
            <Post
              key={post.item.id}
              postData={post.item}
              toggleLike={(id) => {
                const tempPosts = posts.map((tempPost) => {
                  if (tempPost.id === id) {
                    return { ...tempPost, isLiked: !tempPost.isLiked };
                  }
                  return tempPost;
                });
                setPostsList(tempPosts);
              }}
              toggleDislike={(id) => {
                const tempPosts = posts.map((tempPost) => {
                  if (tempPost.id === id) {
                    return { ...tempPost, isDisliked: !tempPost.isDisliked };
                  }
                  return tempPost;
                });
                setPostsList(tempPosts);
              }}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
});
