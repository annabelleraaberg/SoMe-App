// Lecture code: https://github.com/studBrage/Kryssplattform-HK-H24/blob/main/api/imageApi.ts

import { getStorageRef } from "@/firebaseConfig";
import { uploadBytes, uploadBytesResumable } from "firebase/storage";

export const uploadImageToFirebase = async (uri: string) => {
  const fetchResponse = await fetch(uri);
  const blob = await fetchResponse.blob();

  console.log("Uri: ", uri);
  const imagePath = uri.split("/").pop()?.split(".")[0] ?? "anonymtBilde";
  console.log("imagepath", imagePath);

  const uploadPath = `images/${imagePath}`;

  const imageRef = getStorageRef(uploadPath);

  try {
    console.log("pls");
    console.log("Blob size:", blob.size); 
    await uploadBytes(imageRef, blob);
    //await uploadBytesResumable(imageRef, blob);
    console.log("Uploading image to", uploadPath);
    return uploadPath;
  } catch (e) {
    console.error("error uploading image", e);
    return "ERROR";
  }
};
