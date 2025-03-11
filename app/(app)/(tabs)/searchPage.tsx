// Based on lecture code: https://github.com/studBrage/Kryssplattform-HK-H24/blob/main/app/(app)/(tabs)/index.tsx

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  RefreshControl,
} from "react-native";
import { useState, useEffect } from "react";
import { PostData } from "@/utils/postData";
import Spacer from "@/components/Spacer";
import Post from "@/components/Post";
import * as postApi from "@/api/postApi";
import { EvilIcons } from "@expo/vector-icons";

export default function SearchPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [searchString, setSearchString] = useState("");
  const [isDescending, setIsDescending] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");

  const getPostsFromBackend = async () => {
    setRefreshing(true);
    const posts = await postApi.getAllPosts();
    setPosts(posts);
    setRefreshing(false);
  };

  const getSearchedPostsFromBackend = async (searchTerm: string) => {
    setRefreshing(true);
    const posts = await postApi.getAllPosts();
    const filteredPosts = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log("Filtered posts: ", filteredPosts);
    setPosts(filteredPosts);
    setRefreshing(false);
  };

  const getSortedPostsFromBackend = async (isDesc: boolean) => {
    setRefreshing(true);
    const posts = await postApi.getSortedPosts(isDesc);
    setPosts(posts);
    setRefreshing(false);
  };

  const getPostsByCategoryFromBackend = async (category: string) => {
    setRefreshing(true);
    const posts = await postApi.getPostsByCategory(category);
    setPosts(posts);
    setRefreshing(false);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchString.trim()) {
        console.log("Search string: ", searchString);
        getSearchedPostsFromBackend(searchString);
      } else {
        setPosts([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchString]);

  return (
    <View className="flex-1 justify-center items-center">
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBarInput}
          value={searchString}
          onChangeText={(text) => {
            setSearchString(text);
            console.log("Updated search string:", text);
          }}
          placeholder="Search by title or user"
        />
        <Pressable
          style={styles.filterButton}
          onPress={async () => {
            setIsDescending(!isDescending);
            await getSortedPostsFromBackend(isDescending);
          }}
          accessible={true}
          accessibilityLabel={
            isDescending ? "Sort posts from A to Z" : "Sort posts from Z to A"
          }
          accessibilityHint="Tap to change the order of the posts"
        >
          <Text>{isDescending ? "Å-A" : "A-Å"}</Text>
        </Pressable>
      </View>
      <View style={styles.categoryContainer}>
        {["Painting", "Drawing", "Sculpture", "Photography", "Digital art"].map(
          (category) => (
            <Pressable
              key={category}
              onPress={() => {
                setSelectedCategory(category);
                getPostsByCategoryFromBackend(category);
              }}
              accessible={true}
              accessibilityLabel="Select category"
              accessibilityHint="Tap to view posts by category"
            >
              <View
                style={[
                  selectedCategory === category &&
                    styles.selectedCategoryButton,
                ]}
              >
                <Text
                  style={[selectedCategory === category && styles.categoryText]}
                >
                  {category}
                </Text>
              </View>
            </Pressable>
          )
        )}
      </View>

      <View style={styles.postsContainer}>
        {posts.length === 0 ? (
          <View style={styles.postsPlaceholder}>
            <Text>No posts to show</Text>
            {/* Icon from icons.expo: https://icons.expo.fyi/Index/EvilIcons/image */}
            <EvilIcons name="image" size={50} color="gray" />
          </View>
        ) : (
          <FlatList
            data={posts}
            numColumns={2}
            ListHeaderComponent={() => <Spacer height={10} />}
            ListFooterComponent={() => <Spacer height={50} />}
            ItemSeparatorComponent={() => <Spacer height={8} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={getPostsFromBackend}
              />
            }
            renderItem={(post) => (
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
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
    width: "100%",
    marginTop: 5,
  },
  searchBarInput: {
    width: "90%",
    borderWidth: 1,
    padding: 10,
    marginTop: 2,
    borderRadius: 20,
  },
  filterButton: {
    backgroundColor: "lightgray",
    borderRadius: 20,
    padding: 10,
    marginLeft: 5,
  },
  categoryContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-evenly",
    marginTop: 10,
    alignItems: "center",
  },
  categoryText: {
    color: "white",
    fontWeight: "bold",
  },
  selectedCategoryButton: {
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#AA0E4C",
  },
  postsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  postsPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
});
