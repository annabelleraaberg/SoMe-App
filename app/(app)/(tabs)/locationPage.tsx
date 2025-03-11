// Based on lecture code: https://github.com/studBrage/Kryssplattform-HK-H24/blob/main/app/(app)/(tabs)/postsMapPage.tsx

import { getAllPosts } from "@/api/postApi";
import MapComponent from "@/components/MapComponent";
import { getData } from "@/utils/local_storage";
import { PostData } from "@/utils/postData";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LocationPage() {
  const [posts, setPosts] = useState<PostData[]>([]);

  // Get posts from backend and store them locally to display with marker on map
  const getPosts = async () => {
    try {
      const backendPosts = await getAllPosts();
      await AsyncStorage.setItem("posts", JSON.stringify(backendPosts));
      setPosts(backendPosts);
    } catch (error) {
      console.error("Error fetching posts from backend:", error);
      // Fallback to local storage if backend fails
      const localPosts = await getData("posts");
      if (localPosts) {
        setPosts(JSON.parse(localPosts));
      }
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <View style={styles.mapViewContainer}>
      <MapComponent
        initialRegion={{
          latitude: 59.917104578,
          longitude: 10.727706144,
          latitudeDelta: 0.0422,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        postPosition={{
          location: {
            latitude: 59.917104578,
            longitude: 10.727706144,
          },
        }}
      >
        {posts.length > 0 &&
          posts.map((post) => (
            <Marker
              coordinate={{
                latitude: post.location?.latitude ?? 0,
                longitude: post.location?.longitude ?? 0,
              }}
              key={post.id}
              accessible={true}
              accessibilityLabel="Tap for post details"
              accessibilityHint="Tap marker to view post details"
            >
              <Callout>
                <Pressable
                  onPress={() => {
                    router.navigate({
                      pathname: "/(app)/postDetails/[id]",
                      params: { id: post.id },
                    });
                  }}
                >
                  <View style={styles.postPreviewContainer}>
                    <View>
                      <Image
                        style={styles.postImage}
                        source={{ uri: post.imageURL }}
                      />
                    </View>
                    <Text style={styles.postTitle}>{post?.title}</Text>
                    <Text>{post?.abstract}</Text>
                  </View>
                </Pressable>
              </Callout>
            </Marker>
          ))}
      </MapComponent>
    </View>
  );
}

const styles = StyleSheet.create({
  mapViewContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  postPreviewContainer: {
    width: 200,
    height: 200,
  },
  postImage: {
    width: 200,
    height: 150,
    resizeMode: "cover",
  },
  postTitle: {
    fontWeight: "bold",
  },
});
