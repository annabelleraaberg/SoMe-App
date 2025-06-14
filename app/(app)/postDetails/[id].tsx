// Based on lecture code: https://github.com/studBrage/Kryssplattform-HK-H24/blob/main/app/(app)/postDetails/%5Bid%5D.tsx

import { useSession } from "@/providers/authctx";
import Post from "@/components/Post";
import { CommentObject, PostData } from "@/utils/postData";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  Modal,
  FlatList,
  Platform,
} from "react-native";

import * as postApi from "@/api/postApi";
import * as commentApi from "@/api/commentApi";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import MapComponent from "@/components/MapComponent";
import { usePostContext } from "@/providers/PostContext";
import { formatPostDate } from "@/utils/formatDate";
import AuthorModal from "@/components/AuthorModal";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function postDetails() {
  const { id } = useLocalSearchParams();
  const { updatePost } = usePostContext();
  const [post, setPost] = useState<PostData | null>(null);
  const [postComments, setPostComments] = useState<CommentObject[]>([]);
  const [postLocation, setPostLocation] = useState("Loading");
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [isLoadingAddComment, setIsLoadingAddComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const visibleCommentIds = useRef<string[]>([]);

  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [authorPosts, setAuthorPosts] = useState<PostData[]>([]);

  const [isLoadingAuthorData, setIsLoadingAuthorData] = useState(false);

  const { userNameSession, user } = useSession();
  const { deletePost } = usePostContext();

  const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
    useState(false);

  const router = useRouter();

  const fetchComments = async (commentIds: string[]) => {
    const comments = await commentApi.getCommentsByIds(commentIds);
    if (comments) {
      setPostComments(comments);
    }
    setIsLoadingComments(false);
  };

  const fetchPostFromBackend = async () => {
    const backendPost = await postApi.getPostById(id as string);
    console.log("Post Author ID:", post?.authorId);
    console.log("Current User UID:", user?.uid);

    if (backendPost) {
      setPost(backendPost);
      updatePost(backendPost);
      fetchComments(backendPost.comments);
      visibleCommentIds.current = backendPost.comments;

      if (backendPost.location) {
        const location = await Location.reverseGeocodeAsync({
          latitude: backendPost.location?.latitude ?? 0,
          longitude: backendPost.location?.longitude ?? 0,
        });
        const locationName =
          location && location.length > 0
            ? location[0].name ?? "Unknown"
            : "Unknown";
        setPostLocation(locationName);
      } else {
        setPostLocation("Unknown");
      }
    }
  };

  const formattedDate = post?.date.toDate && formatPostDate(post.date.toDate());

  useEffect(() => {
    fetchPostFromBackend();
  }, []);

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading post...</Text>
      </View>
    );
  }

  // Added to fetch posts by authorId
  const handleAuthorModalOpen = async () => {
    console.log("Opening Author Modal...");
    setIsLoadingAuthorData(true);

    const postAuthor = post?.authorId;
    if (!postAuthor) {
      console.error("No author");
      setIsLoadingAuthorData(false);
      return;
    }
    console.log(`Fetching posts for authorId: ${postAuthor}`);
    try {
      setIsAuthorModalOpen(true);
      const postsByAuthor = await postApi.getPostsByAuthor(postAuthor, true);
      if (postsByAuthor.length === 0) {
        console.warn(`No posts found for authorId: ${postAuthor}`);
      } else {
        console.log(`Fetched ${postsByAuthor.length} posts:`, postsByAuthor);
      }
      setAuthorPosts(postsByAuthor);
    } catch (error) {
      console.error("Error retrieving posts for author:", error);
    }
    setIsLoadingAuthorData(false);
  };

  const handleDeletePost = async () => {
    await deletePost(id as string);
    setDeleteSuccess(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerTitle: (props) => (
            <Text style={styles.headerTitle}>About the artwork</Text>
          ),
          headerRight: () => {
            // Checks if the user is the author. If not the delete button isn't visible.
            if (post && user?.uid === post.authorId) {
              console.log("authorId", post.authorId);
              console.log("user uid: ", user?.uid);

              return (
                <Pressable
                  accessibilityLabel="Delete post"
                  accessibilityHint="Deletes the current post"
                  onPress={() => {
                    console.log("delete post button pressed");
                    //handleDeletePost();
                    setIsConfirmationModalVisible(true);
                  }}
                >
                  <Text>Delete post</Text>
                </Pressable>
              );
            }
            return null;
          },
        }}
      />

      <ScrollView>
        {/* Post details */}
        <Image
          style={styles.imageStyle}
          source={{ uri: post?.imageURL }}
          accessibilityLabel="Post image"
          accessibilityRole="image"
        />
        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleStyle}>{post?.title}</Text>
            <View style={styles.postDataContainer}>
              <Pressable
                accessible={true}
                accessibilityLabel="Post author. Navigate to author profile."
                accessibilityRole="link"
                onPress={handleAuthorModalOpen}
              >
                <Text style={styles.authorButton}>{post?.author}</Text>
              </Pressable>
            </View>
          </View>
          <Text>Category: {post?.category}</Text>
          <Text style={styles.abstractStyle}>{post?.abstract}</Text>
          <Text className="text-gray-700">{post?.hashtags}</Text>
          <Text style={styles.dateStyle}>{formattedDate}</Text>

          {/* Comments */}
          <View style={styles.commentContainer}>
            <Text>Comments</Text>
            <View>
              {isLoadingComments ? (
                <ActivityIndicator />
              ) : (
                postComments.map((comment) => {
                  return (
                    <View key={comment.id} style={styles.commentBlock}>
                      <View key={comment.id} style={styles.commentItem}>
                        <Text className="text-gray-700">
                          {comment.comment.authorName}
                        </Text>
                        <Text>{comment.comment.comment}</Text>
                      </View>
                      {comment.comment.authorId === user?.uid && (
                        <Pressable
                          onPress={() => {
                            commentApi.deleteComment(
                              comment.id,
                              post?.id ?? ""
                            );
                            setPostComments(
                              postComments.filter((c) => c.id !== comment.id)
                            );
                            visibleCommentIds.current =
                              visibleCommentIds.current.filter(
                                (id) => id !== comment.id
                              );
                          }}
                        >
                          <Text>Delete</Text>
                        </Pressable>
                      )}
                    </View>
                  );
                })
              )}
            </View>
            <View style={styles.commentInputContainer}>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Write a comment..."
                style={styles.commentInput}
                accessibilityLabel="Enter your comment"
              />
              <Pressable
                style={styles.addButton}
                onPress={async () => {
                  if (post && commentText !== "") {
                    setIsLoadingAddComment(true);
                    const newComment = await commentApi.addComment(post.id, {
                      authorId: user?.uid ?? "unknown",
                      comment: commentText,
                      authorName: userNameSession ?? "unknown",
                    });
                    if (newComment) {
                      visibleCommentIds.current.push(newComment);
                      await fetchComments(visibleCommentIds.current);
                      setCommentText("");
                      setIsLoadingAddComment(false);
                    }
                  }
                }}
              >
                {isLoadingAddComment ? (
                  <ActivityIndicator accessibilityLabel="Loading comments" />
                ) : (
                  <Text style={styles.addButtonText}>Add</Text>
                )}
              </Pressable>
            </View>
          </View>

          {/* Map and location display */}
          {post && (
            <View style={styles.mapContainer}>
              {Platform.OS === "ios" && postLocation !== "Unknown" && (
                <Text>{`Exhibition location: ${postLocation}`}</Text>
              )}

              <MapComponent
                initialRegion={{
                  latitude: post?.location?.latitude ?? 0,
                  longitude: post?.location?.longitude ?? 0,
                  latitudeDelta: 0.0082,
                  longitudeDelta: 0.0081,
                }}
                postPosition={{
                  location: {
                    latitude: post?.location?.latitude ?? 0,
                    longitude: post?.location?.longitude ?? 0,
                  },
                }}
              >
                <Marker
                  coordinate={{
                    latitude: post?.location?.latitude ?? 0,
                    longitude: post?.location?.longitude ?? 0,
                  }}
                />
              </MapComponent>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Author modal: open to view user profile */}
      <AuthorModal
        visible={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
        authorName={post?.author ?? "Unknown"}
        posts={authorPosts}
        isLoading={isLoadingAuthorData}
      />

      {/* Delete post */}
      <ConfirmationModal
        visible={isConfirmationModalVisible}
        onClose={() => setIsConfirmationModalVisible(false)}
        onConfirm={handleDeletePost}
        message="Are you sure you want to delete this post?"
      />

      {/* Success delete message */}
      <Modal visible={deleteSuccess} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.successMessage}>
              Post deleted successfully!
            </Text>
            <Pressable
              onPress={() => {
                setDeleteSuccess(false);
                router.back();
              }}
              accessibilityLabel="Close success message"
            >
              <Text>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  imageStyle: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  titleStyle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  abstractStyle: {
    fontSize: 16,
    marginBottom: 10,
    marginTop: 10,
  },
  postDataContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
  },
  authorButton: {
    color: "#1D4ED8",
    textDecorationLine: "underline",
    fontSize: 16,
  },
  dateStyle: {
    paddingTop: 8,
  },
  commentContainer: {
    paddingTop: 16,
  },
  commentBlock: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  commentItem: {
    flexDirection: "row",
    gap: 4,
  },
  commentInputContainer: {
    paddingTop: 16,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commentInput: {
    borderBottomWidth: 1,
    borderColor: "gray",
    width: "80%",
    marginTop: 2,
    borderRadius: 5,
    alignItems: "center",
    height: 30,
    padding: 5,
  },
  addButton: {
    position: "absolute",
    right: 8,
    top: "50%",
    width: 54,
    height: 44,
    backgroundColor: "#AA0E4C",
    color: "#FFFFFF",
    borderRadius: 20,
    //marginRight: 55,
  },
  addButtonText: {
    color: "white",
    textAlign: "center",
    lineHeight: 44,
  },
  mapContainer: {
    width: "100%",
    height: 250,
    paddingTop: 20,
    paddingBottom: 10,
  },
  mapStyle: {
    marginTop: 8,
    width: "100%",
    height: 150,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  successMessage: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#AA0E4C",
  },
});
