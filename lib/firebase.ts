import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD6tTJFX5CYwYOW1WXURLY2JX9nbHahSG8",
  authDomain: "feedbackk-1d21d.firebaseapp.com",
  projectId: "feedbackk-1d21d",
  storageBucket: "feedbackk-1d21d.firebasestorage.app",
  messagingSenderId: "55628190853",
  appId: "1:55628190853:web:b5acbd0c5cd920f76e85ec",
  measurementId: "G-B31TD4LJ35",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
