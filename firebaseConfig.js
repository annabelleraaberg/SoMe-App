// Based on lecture code: https://github.com/studBrage/Kryssplattform-HK-H24/blob/main/firebaseConfig.js
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import firebaseConfig from "./firebaseEnv.js";
import { getFirestore } from "firebase/firestore";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence:
    Platform.OS === "web"
      ? browserSessionPersistence
      : getReactNativePersistence(ReactNativeAsyncStorage),
});

GoogleSignin.configure({
  webClientId:
    "51247988510-q902u1q9f76c4bhaf9o62u8pmj9m5dgn.apps.googleusercontent.com",
});

export const db = getFirestore(app);

const storage = getStorage(app);

export const getStorageRef = (path) => ref(storage, path);

export const getDownloadUrl = async (path) => {
  const url = await getDownloadURL(ref(storage, path));
  return url;
};
