// Based on lecture code: https://github.com/studBrage/Kryssplattform-HK-H24/blob/main/components/Post.tsx

import { useSession } from "@/providers/authctx";
import { PostData } from "@/utils/postData";
import { useState } from "react";
import * as postApi from "@/api/postApi";
import { Link } from "expo-router";
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  Text,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type PostProps = {
  postData: PostData;
  toggleLike: (id: string) => void;
  toggleDislike: (id: string) => void;
};

export default function Post({
  postData,
  toggleLike,
  toggleDislike,
}: PostProps) {
  const { user } = useSession();
  const isGuest = !user;

  const [isLiked, setIsLiked] = useState(
    postData.likes?.includes(user?.uid ?? "") ?? false
  );
  const [isDisliked, setIsDisliked] = useState(
    postData.dislikes?.includes(user?.uid ?? "") ?? false
  );

  const [numLikes, setNumLikes] = useState(postData.likes?.length ?? 0);
  const [numDislikes, setNumDislikes] = useState(
    postData.dislikes?.length ?? 0
  );

  const handleLikePress = async () => {
    if (isGuest) return;
    if (isLiked) {
      setNumLikes(numLikes - 1);
      setIsLiked(false);
    } else {
      setNumLikes(numLikes + 1);
      setIsLiked(true);
      if (isDisliked) {
        setNumDislikes(numDislikes - 1);
        setIsDisliked(false);
      }
    }
    await postApi.toggleLikePost(postData.id, user?.uid ?? "");
  };

  const handleDislikePress = async () => {
    if (isGuest) return;
    if (isDisliked) {
      setNumDislikes(numDislikes - 1);
      setIsDisliked(false);
    } else {
      setNumDislikes(numDislikes + 1);
      setIsDisliked(true);
      if (isLiked) {
        setNumLikes(numLikes - 1);
        setIsLiked(false);
      }
    }
    await postApi.toggleDislikePost(postData.id, user?.uid ?? "");
  };

  const handlePress = async (action: "like" | "dislike", event: any) => {
    if (Platform.OS === "web") {
      // Prevent the default action, to avoid page refresh on web
      event.preventDefault();
    }
    if (action === "like") {
      await handleLikePress();
    }
    if (action === "dislike") {
      await handleDislikePress();
    }
  };

  const postContent = (
    <View style={styles.postContainer}>
      <Image
        accessible={true}
        accessibilityLabel="Post Image. Navigate to post details."
        accessibilityRole="link"
        style={styles.postImage}
        source={{ uri: postData.imageURL }}
      />
      <View style={styles.textContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.postTitle}>{postData.title}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View style={styles.thumbsContainer}>
              <View>
                <Text>{numLikes}</Text>

                <Pressable
                  accessible={true}
                  accessibilityLabel="Like post"
                  onPress={(event) => handlePress("like", event)}
                >
                  {/* Icon from icons.expo: https://icons.expo.fyi/Index/MaterialIcons/thumb-up-alt */}
                  <MaterialIcons
                    name="thumb-up-alt"
                    size={24}
                    // Added to prevent guests from liking posts
                    color={isLiked && !isGuest ? "#AA0E4C" : "gray"}
                  />
                </Pressable>
              </View>
              <View>
                <Text>{numDislikes}</Text>
                <Pressable
                  accessible={true}
                  accessibilityLabel="Dislike post"
                  onPress={(event) => handlePress("dislike", event)}
                >
                  {/* Icon from icons.expo: https://icons.expo.fyi/Index/MaterialIcons/thumb-down-alt */}
                  <MaterialIcons
                    name="thumb-down-alt"
                    size={24}
                    // Added to prevent guests from disliking posts
                    color={isDisliked && !isGuest ? "#AA0E4C" : "gray"}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
        <Text style={styles.abstractContainer}>{postData.abstract}</Text>
        <View style={styles.bottomContainer}>
          <Text style={styles.authorText}>{postData.author}</Text>
        </View>
      </View>
    </View>
  );

  if (isGuest) {
    // Post without a link for guests so they can't see post details
    return <Pressable>{postContent}</Pressable>;
  } else {
    // Post wrapped with a link for users
    return (
      <Link
        href={{
          pathname: "/(app)/postDetails/[id]",
          params: { id: postData.id },
        }}
        asChild
      >
        <Pressable>{postContent}</Pressable>
      </Link>
    );
  }
}

const styles = StyleSheet.create({
  postContainer: {
    flex: 1,
    maxWidth: 180,
    width: 180,
    margin: 8,
  },
  postImage: {
    height: 170,
    width: "100%",
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
    resizeMode: "cover",
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 16,
    backgroundColor: "white",
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  postTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flexShrink: 1,
  },
  abstractContainer: {
    padding: 2,
    flex: 1
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
  },
  authorText: {
    fontSize: 12,
    color: "gray",
    textDecorationLine: "underline",
  },
  thumbsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
