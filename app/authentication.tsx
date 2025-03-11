// Based on lecture code: https://github.com/studBrage/Kryssplattform-HK-H24/blob/main/app/authentication.tsx

import { useSession } from "@/providers/authctx";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as authApi from "@/api/authApi";
import { router } from "expo-router";

const Authentication = () => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const { signIn, signInAsGuest } = useSession();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View style={styles.mainContainer}>
        <Text style={styles.welcomeText}>Welcome to Art Vista</Text>
        {isSignUp && (
          <View style={styles.textFieldContainer}>
            <Text>Username</Text>
            <TextInput
              value={userName}
              onChangeText={setUserName}
              style={styles.textField}
              placeholder="username"
              accessibilityLabel="Enter your username"
            />
          </View>
        )}
        <View style={styles.textFieldContainer}>
          <Text>Email</Text>
          <TextInput
            value={userEmail}
            onChangeText={setUserEmail}
            style={styles.textField}
            placeholder="email"
            accessibilityLabel="Enter your email address"
          />
        </View>
        <View style={styles.textFieldContainer}>
          <Text>Password</Text>
          <TextInput
            value={password}
            secureTextEntry={true}
            onChangeText={setPassword}
            style={styles.textField}
            placeholder="password"
            accessibilityLabel="Enter your password"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.primaryButton}
            onPress={async () => {
              // Added to convert input to lowercase since the simulator automatically
              // set it to uppercase making userEmail wrong every time.
              const lowerCaseEmail = userEmail.toLowerCase();

              if (isSignUp) {
                try {
                  await authApi.signUp(lowerCaseEmail, password, userName);

                  await signIn(lowerCaseEmail, password);
                } catch (error) {
                  console.log("Error during sign-up", error);
                }
              } else {
                signIn(lowerCaseEmail, password);
              }
            }}
          >
            <Text style={styles.primaryButtonText}>
              {isSignUp ? "Create account" : "Log in"}
            </Text>
          </Pressable>
          {!isSignUp && (
            <Pressable
              onPress={() => {
                signInAsGuest();
                router.replace("/overviewPage");
              }}
              accessibilityHint="Continue without signing in"
            >
              <Text style={styles.guestButton}>Continue as guest</Text>
            </Pressable>
          )}

          {isSignUp && (
            <Pressable
              style={styles.secondaryButton}
              onPress={() => setIsSignUp(false)}
              accessibilityLabel="Cancel sign up"
              accessibilityHint="Cancel sign-up process and return to login"
            >
              <Text>Cancel</Text>
            </Pressable>
          )}
        </View>

        {!isSignUp && (
          <Pressable
            style={styles.accountButton}
            onPress={() => {
              setIsSignUp(true);
            }}
          >
            <Text>Create account</Text>
          </Pressable>
        )}

        {!isSignUp && (
          <Pressable
            style={styles.primaryButton}
            onPress={async () => {
              await authApi.signInWithGoogle();
            }}
          >
            <Text style={styles.primaryButtonText}>Sign in with Google</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default Authentication;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    width: "100%",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "arial",
  },
  textField: {
    borderWidth: 1,
    padding: 10,
    marginTop: 2,
    borderColor: "gray",
    borderRadius: 5,
  },
  textFieldContainer: {
    width: "100%",
    paddingTop: 16,
  },
  accountButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    padding: 10,
    borderRadius: 50,
    backgroundColor: "#D3D3D3",
    marginBottom: 6
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  primaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    padding: 10,
    height: 50,
    borderRadius: 50,
    backgroundColor: "#AA0E4C",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  secondaryButton: {
    padding: 10,
    height: 50,
    borderRadius: 50,
    borderColor: "gray",
  },
  guestButton: {
    marginTop: 10,
    marginBottom: 10,
    textDecorationLine: "underline",
    color: "black",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "D3D3D3",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
});
