// Based on lecture code: https://github.com/studBrage/Kryssplattform-HK-H24/blob/main/components/PostForm.tsx

import { useSession } from "@/providers/authctx";
import { useRef, useState, useEffect } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Image,
  Text,
  TextInput,
  ActivityIndicator,
} from "react-native";

import * as Location from "expo-location";
import * as postApi from "@/api/postApi";
import SelectImageModal from "./SelectImageModal";
import { EvilIcons } from "@expo/vector-icons";
import { PostData } from "@/utils/postData";
import { Timestamp } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";

type PostFormProps = {
  addNewPost: (PostData: PostData) => void;
  closeModal: () => void;
};

export default function PostForm({ addNewPost, closeModal }: PostFormProps) {
  const [titleText, setTitleText] = useState("");
  const [abstractText, setAbstractText] = useState("");
  const [hashtagText, setHashtagText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("None");
  const [image, setImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const { userNameSession, user } = useSession();

  const [statusText, setStatusText] = useState<string | null>(null);
  const [location, setLocation] =
    useState<Location.LocationGeocodedAddress | null>(null);

  const postCoordinatesData = useRef<Location.LocationObjectCoords | null>(
    null
  );

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setStatusText("Permission to access location has been given");
        return;
      }
    })();
  }, []);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setStatusText("Permission to access location has not been given");
      return;
    }

    let location = await Location.getCurrentPositionAsync();
    postCoordinatesData.current = location.coords;
    const locationAddress = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    setLocation(locationAddress[0]);
  };

  const categories = [
    "None",
    "Painting",
    "Drawing",
    "Sculpture",
    "Photography",
    "Digital art",
  ];

  let text = "Dette blir en kul geolokasjon wow!";
  if (statusText) {
    text = statusText;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View style={styles.mainContainer}>
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#AA0E4C" />
          <Text style={styles.loadingText}>Uploading post...</Text>
        </View>
      </Modal>
      <ScrollView
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.contentContainer}>
          <Modal visible={isCameraOpen} animationType="slide">
            <SelectImageModal
              closeModal={() => {
                setIsCameraOpen(false);
                getLocation();
              }}
              setImage={setImage}
            />
          </Modal>
          <Pressable
            accessible={true}
            accessibilityLabel="Add image to post"
            accessibilityHint="Choose an image from the library or take a picture"
            onPress={() => setIsCameraOpen(true)}
            style={styles.addImageBox}
          >
            {image ? (
              <Image
                source={{ uri: image }}
                style={{ resizeMode: "cover", width: "100%", height: 300 }}
                alt="Select image"
              />
            ) : (
              <EvilIcons name="image" size={80} color="gray" />
            )}
          </Pressable>
          <Text>{`${location?.street} ${location?.streetNumber} - ${location?.city}. ${location?.country}`}</Text>

          <View style={styles.textFieldContainer}>
            <Text style={styles.text}>Title</Text>
            <TextInput
              accessible={true}
              accessibilityLabel="Title input"
              onChangeText={setTitleText}
              value={titleText}
              style={styles.textfield}
              placeholder="add title..."
            />
          </View>

          <View style={styles.textFieldContainer}>
            <Text style={styles.text}>Abstract</Text>
            <TextInput
              accessible={true}
              accessibilityLabel="Abstract input"
              multiline
              numberOfLines={3}
              onChangeText={setAbstractText}
              value={abstractText}
              style={[styles.textfield, { height: 84 }]}
              placeholder="add abstract..."
            />
          </View>
          <View style={styles.textFieldContainer}>
            <Text style={styles.text}>Hashtags</Text>
            <TextInput
              accessible={true}
              accessibilityLabel="Hashtag input"
              onChangeText={setHashtagText}
              value={hashtagText}
              style={styles.textfield}
              placeholder="#art"
            />
          </View>
          <Text style={styles.text}>Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              accessible={true}
              accessibilityLabel="Select category"
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => {
                setSelectedCategory(itemValue);
                console.log("Selected category: ", itemValue);
              }}
              style={styles.picker}
            >
              {categories.map((category) => (
                <Picker.Item label={category} value={category} key={category} />
              ))}
            </Picker>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={styles.primaryButton}
              onPress={async () => {
                setLoading(true);
                const newPost: PostData = {
                  id: `postName-${titleText}`,
                  title: titleText,
                  abstract: abstractText,
                  author: userNameSession || "anonymous",
                  authorId: user?.uid || "unknown",
                  hashtags: hashtagText,
                  category: selectedCategory,
                  date: Timestamp.now(),
                  isLiked: false,
                  isDisliked: false,
                  likes: [],
                  dislikes: [],
                  imageURL: image || "",
                  location: postCoordinatesData.current,
                  comments: [],
                };

                await postApi.createPost(newPost);
                setLoading(false);
                addNewPost(newPost);
                setTitleText("");
                setAbstractText("");
                setHashtagText("");
                setSelectedCategory("");
              }}
            >
              <Text style={{ color: "white" }}>Add post</Text>
            </Pressable>

            <Pressable
              accessible={true}
              accessibilityLabel="Cancel post creation"
              accessibilityHint="Cancel the post creating and close form"
              style={styles.secondaryButton}
              onPress={() => closeModal()}
            >
              <Text style={{ color: "black" }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D3D3D3",
  },
  loadingText: {
    color: "black",
    fontSize: 18,
    marginTop: 10,
  },
  contentContainer: {
    width: "100%",
    flexDirection: "column",
    paddingHorizontal: 20,
  },
  textFieldContainer: {
    paddingTop: 8,
  },
  addImageBox: {
    borderRadius: 10,
    overflow: "hidden",
    width: "100%",
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "gray",
  },
  text: {
    marginTop: 4,
    fontWeight: "bold"
  },
  textfield: {
    borderWidth: 1,
    padding: 10,
    marginTop: 2,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  primaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#AA0E4C",
    height: 50,
    borderRadius: 50,
    justifyContent: "center",
  },
  secondaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "gray",
    height: 50,
    borderRadius: 50,
    justifyContent: "center",
  },
  picker: {
    width: "100%",
  },
  pickerContainer: {
    width: "100%",
    overflow: "hidden",
    justifyContent: "center",
    height: 120,
  },
});
