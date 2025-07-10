import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD5pVfUrJ6wnfq-rBQzNxI4sO4iEM2q7ig",
  authDomain: "koifish-42e91.firebaseapp.com",
  projectId: "koifish-42e91",
  storageBucket: "koifish-42e91.appspot.com",
  messagingSenderId: "24778655442",
  appId: "1:24778655442:web:13500a168db5dbd2b9cf0b",
  measurementId: "G-8QD98H86HC"
};
// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const googleProvider = new GoogleAuthProvider();

export const storage = getStorage(app);

export const auth = getAuth(app);

