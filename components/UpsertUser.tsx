// Lecture code: https://github.com/studBrage/Kryssplattform-HK-H24/blob/main/components/UpsertUser.tsx

import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View, Text } from "react-native";

type UpsertUserProps = {
  closeModal: () => void;
  createUserName: (name: string) => void;
};

export default function UpsertUser({
  closeModal,
  createUserName,
}: UpsertUserProps) {
  const [userName, setUserName] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log in to your account</Text>
      <View>
        <Text>Type in username</Text>
        <TextInput
          value={userName}
          onChangeText={setUserName}
          style={styles.textField}
          placeholder="username"
        />
      </View>
      <View>
        <Pressable
          style={styles.primaryButton}
          onPress={() => {
            createUserName(userName);
            setUserName("");
          }}
        >
          <Text style={styles.primaryButtonText}>Log in</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton}>
          <Text>Cancel</Text>
        </Pressable>
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
  title: {
    fontSize: 20,
    fontWeight: "bold"
  },
  textField: {
    borderWidth: 1,
    padding: 10,
    marginTop: 2,
    borderColor: "D3D3D3",
    borderRadius: 50,
  },
  primaryButton: {
    borderRadius: 50,
    padding: 10,
    backgroundColor: "#AA0E4C",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  primaryButtonText: {
    color: "white",
  },
  secondaryButton: {
    borderRadius: 50,
    borderWidth: 1,
    padding: 10,
    borderColor: "D3D3D3",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
});
