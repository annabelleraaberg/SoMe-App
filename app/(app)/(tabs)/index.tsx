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
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Index() {
  const [postsList, setPostsList] = useState<PostData[]>([]);
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
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
                style={styles.uploadButton}
                onPress={() => setIsPostFormOpen(true)}
                accessibilityLabel="Open upload post form"
              >
                <Text allowFontScaling={true}>Upload</Text>
                {/* Icon from Expo Vector Icons: https://icons.expo.fyi/Index/Ionicons/add */}
                <Ionicons name="add" size={24} color="black" />
              </Pressable>
            ) : null,
          headerLeft: () => (
            <Pressable
              style={styles.userNameDisplay}
              onPress={() => {
                if (!userNameSession) {
                  router.push("/authentication");
                }
              }}
            >
              <Text allowFontScaling={true} style={styles.userNameText}>
                {userNameSession ? (
                  userNameSession
                ) : (
                  <Text allowFontScaling={true} className="text-blue-700">
                    Log in
                  </Text>
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

      {/* Open PostForm */}
      <Modal visible={isPostFormOpen} animationType="slide">
        <PostForm
          addNewPost={async () => {
            await getPostsFromBackend();
            setIsPostFormOpen(false);
          }}
          closeModal={() => setIsPostFormOpen(false)}
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
  uploadButton: {
    marginRight: 6,
    fontWeight: "bold",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    paddingHorizontal: 10,
    backgroundColor: "#EBBCCF",
  },
  userNameDisplay: {
    padding: 6,
  },
  userNameText: {
    fontSize: 16,
  },
});
