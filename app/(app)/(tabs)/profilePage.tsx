// Based on lecture code: https://github.com/studBrage/Kryssplattform-HK-H24/blob/main/components/PostForm.tsx

import { getPostsByAuthor } from "@/api/postApi";
import Post from "@/components/Post";
import { useSession } from "@/providers/authctx";
import { PostData } from "@/utils/postData";
import { Link } from "expo-router";
import { useState, useEffect } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function ProfilePage() {
  const [refreshing, setRefreshing] = useState(false);
  const [userPosts, setUserPosts] = useState<PostData[]>([]);
  const [loadingLogout, setLoadingLogout] = useState(false);

  const { userNameSession, signOut } = useSession();

  // Added to display posts made by the current user
  const getPostsFromBackend = async () => {
    if (!userNameSession) return;
    console.log("username session", userNameSession);
    setRefreshing(true);
    try {
      const posts = await getPostsByAuthor(userNameSession);
      setUserPosts(posts);
    } catch (error) {
      console.log("Error getching posts by user: ", error);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    getPostsFromBackend();
  }, []);

  const handleLogout = async () => {
    setLoadingLogout(true);
    await signOut();
    setLoadingLogout(false);
  };

  return (
    <View style={styles.container}>
      <Modal visible={loadingLogout} transparent animationType="fade">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#AA0E4C" />
          <Text style={styles.loadingText}>Logging out...</Text>
        </View>
      </Modal>

      <View style={styles.profileContainer}>
        <View style={styles.userProfile}>
          {/* Icon from icons.expo: https://icons.expo.fyi/Index/AntDesign/smile-circle */}
          <AntDesign name="smile-circle" size={40} color="#AA0E4C" />
          <Text style={styles.userNameText}>{userNameSession}</Text>

          <View style={styles.buttonContainer}>
            {userNameSession ? (
              <Pressable style={styles.logOutButton} onPress={handleLogout}>
                <Text>Log out</Text>
              </Pressable>
            ) : (
              <Link asChild href={{ pathname: "/authentication" }}>
                <Pressable style={styles.logInButton}>
                  <Text style={styles.logInButtonText}>Log in</Text>
                </Pressable>
              </Link>
            )}
          </View>
        </View>
      </View>
      {userPosts.length === 0 ? (
        <View style={styles.postPlaceholderContainer}>
          <Text
            style={styles.postPlaceholderText}
            accessible={true}
            accessibilityLabel="You don't have any posts yet"
          >
            No posts yet
          </Text>
          {/* Icon from icons.expo: https://icons.expo.fyi/Index/Entypo/emoji-sad */}
          <Entypo name="emoji-sad" size={24} color="black" />
        </View>
      ) : (
        <FlatList
          data={userPosts}
          numColumns={2}
          keyExtractor={(post) => post.id}
          renderItem={({ item }) => (
            <Post
              key={item.id}
              postData={item}
              toggleLike={() => {
                const updatedPost = userPosts.map((post) =>
                  post.id === item.id
                    ? {
                        ...post,
                        isLiked: !post.isLiked,
                      }
                    : post
                );
                setUserPosts(updatedPost);
              }}
              toggleDislike={() => {
                const updatedPost = userPosts.map((post) =>
                  post.id === item.id
                    ? {
                        ...post,
                        isDisliked: !post.isDisliked,
                      }
                    : post
                );
                setUserPosts(updatedPost);
              }}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D3D3D3",
  },
  loadingText: {
    color: "white",
    fontSize: 18,
    marginTop: 10,
  },
  profileContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    width: "100%",
    borderWidth: 1,
    borderColor: "gray",
    paddingBottom: 10,
  },
  userProfile: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10
  },
  buttonContainer: {
    padding: 5
  },
  userNameText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  logOutButton: {
    padding: 15,
    backgroundColor: "#D3D3D3",
    borderRadius: 20,
  },
  logInButton: {
    padding: 15,
    backgroundColor: "#AA0E4C",
    borderRadius: 20,
  },
  logInButtonText: {
    color: "white",
  },
  postContainer: {
    width: "100%",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  postPlaceholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  postPlaceholderText: {
    fontSize: 16,
    color: "#3B3B3B",
  },
});
