// Based on lecture code: https://github.com/studBrage/Kryssplattform-HK-H24/blob/main/utils/local_storage.ts

import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeData = async (key: string, value: string | null) => {
  try {
    if (value === null) {
      await AsyncStorage.removeItem(key);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  } catch (error) {
    console.error("Error storing data in local storage:", error);
  }
};

export const storeUser = async (user:any) => {
  try {
    console.log("Storing user: ", user);
    await AsyncStorage.setItem("user", JSON.stringify(user));
  } catch (e) {
    console.error(e);
  }
}

export const getData = async (key: string) => {
  try {
    const data = await AsyncStorage.getItem(key);
    if (data !== null) {
      console.log(data);
      return data;
    }
  } catch (e) {
    console.error(e);
  }
};

export const getUser = async () => {
  try {
    const data = await AsyncStorage.getItem("user");
    if (data != null) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error(e)
  }
}

export const deleteData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error(e);
  }
};

export const getPostFromLocalById = async (id: string) => {
  try {
    const posts = await AsyncStorage.getItem("posts");
    if (posts !== null) {
      const parsedPosts = JSON.parse(posts);
      const post = parsedPosts.find((post: any) => post.id === id);
      return post;
    }
  } catch (e) {
    console.error(e);
  }
};

export const isUserLoggedIn = async () => {
  try {
    const value = await AsyncStorage.getItem("user");
    if (value !== null) {
      return true;
    }
  } catch (error) {
    console.error(error);
  }
  return false;
};

export const getItemWithSetter = async (
  key: string,
  setValue: (storedValue: string) => void
) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      setValue(value);
    }
  } catch (error) {
    console.error(error);
  }
};

export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.error(e);
  }
  console.log("Done.");
};
