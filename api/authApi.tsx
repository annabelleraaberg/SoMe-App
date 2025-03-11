// Based on lecture code: https://github.com/studBrage/Kryssplattform-HK-H24/blob/main/api/authApi.ts

import { auth } from "@/firebaseConfig";
import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithCredential,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

export const signIn = async (email: string, password: string) => {
  await signInWithEmailAndPassword(auth, email, password)
    .then((userCredentials) => {
      console.log("User signed in", userCredentials);
    })
    .catch((error) => {
      console.log("Could not log in", error);
    });
};

export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (isSuccessResponse(response)) {
      const user = GoogleSignin.getCurrentUser();
      if (user) {
        const googleCredential = GoogleAuthProvider.credential(user.idToken);
        const userCredential = await signInWithCredential(
          auth,
          googleCredential
        );
        console.log("User signed in with google", userCredential.user.email);
        console.log(
          "User signed in with google",
          userCredential.user.displayName
        );
      }
    }
  } catch (error) {
    console.log("Error signing in with google", error);
  }
};

export const signOut = async () => {
  await auth.signOut().then(() => {
    console.log("Signed out");
  });
};

export const signUp = async (
  email: string,
  password: string,
  username: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await updateProfile(userCredential.user, { displayName: username });

    // Added to make userCredential available immediately, so it can be retreived 
    // and displayed when a user signes up.
    await userCredential.user.reload();
    console.log("User signed up", userCredential.user.displayName);

    return userCredential.user;
  } catch (error) {
    console.log("signUp error:", error);
    throw error;
  }
};
