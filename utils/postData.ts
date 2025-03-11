// Based on lecture code: https://github.com/studBrage/Kryssplattform-HK-H24/blob/main/utils/postData.ts

import { LocationObjectCoords } from "expo-location";
import { Timestamp } from "firebase/firestore";

export interface PostData {
  id: string;
  title: string;
  abstract: string;
  author: string;
  authorId: string;
  hashtags: string;
  category: string;
  date: Timestamp;
  isLiked: boolean;
  isDisliked: boolean;
  likes: string[];
  dislikes: string[];
  imageURL: string;
  location: LocationObjectCoords | null;
  comments: string[];
}

export interface PostObject {
  id: string;
  post: PostData;
}

export interface CommentObject {
  id: string;
  comment: CommentData;
}

export interface CommentData {
  authorId: string;
  authorName: string;
  comment: string;
}
