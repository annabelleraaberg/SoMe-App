import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
} from "react-native";
import Post from "./Post";
import { PostData } from "@/utils/postData";
import { usePostContext } from "@/providers/PostContext";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

type AuthorModalProps = {
  visible: boolean;
  onClose: () => void;
  //onPressPost?: (postId: string) => void;
  authorName?: string;
  posts: PostData[];
  isLoading: boolean;
};

export default function AuthorModal({
  visible,
  onClose,
  authorName,
  posts,
  isLoading,
}: AuthorModalProps) {
  const { updatePost } = usePostContext();
  const router = useRouter();

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const handlePressPost = (postId: string) => {
    console.log("Post clicked:", postId);
    setSelectedPostId(postId);

    // Kaller onClose og logger det
    console.log("Calling onClose...");
    onClose();
  };

  return (
    <Modal visible={visible} onRequestClose={onClose}>
      <View style={styles.authorModal}>
        <View style={styles.authorModalHeader}>
          <Pressable onPress={onClose}>
            <Text style={styles.authorModalCloseText}>Close</Text>
          </Pressable>
          <Text style={styles.titleStyle}>Viewing profile: {authorName}</Text>
          <View style={{ width: 50 }} />
        </View>

        {isLoading ? (
          <Text>Loading author posts...</Text>
        ) : (
          <View style={styles.authorModalContent}>
            {posts?.length === 0 ? (
              <Text>No posts available from this author.</Text>
            ) : (
              <FlatList
                data={posts}
                numColumns={2}
                keyExtractor={(post) => post.id}
                renderItem={({ item }) => (
                  <Post
                    key={item.id}
                    postData={item}
                    toggleLike={() => {
                      const updatedItem = {
                        ...item,
                        isLiked: !item.isLiked,
                      };
                      updatePost(updatedItem);
                    }}
                    toggleDislike={() => {
                      const updatedItem = {
                        ...item,
                        isDisliked: !item.isDisliked,
                      };
                      updatePost(updatedItem);
                    }}
                    onPressPost={handlePressPost}
                  />
                )}
              />
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  authorModal: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 76,
    backgroundColor: "#F2F2F2",
  },
  authorModalContent: {
    paddingTop: 30,
  },
  authorModalHeader: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    backgroundColor: "white",
    position: "absolute",
    top: 0,
    paddingTop: 60,
    zIndex: 1,
    paddingBottom: 6,
    marginBottom: 10,
  },
  authorModalCloseText: {
    color: "#077DFF",
    fontSize: 16,
  },
  titleStyle: {
    fontSize: 22,
    fontWeight: "bold",
  },
});
