import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA5uWw1gk-ZCc6M_N1tHzuec5GHGCSpmBs",
  authDomain: "t-shirt-shop-1155d.firebaseapp.com",
  projectId: "t-shirt-shop-1155d",
  storageBucket: "t-shirt-shop-1155d.firebasestorage.app",
  messagingSenderId: "215841924706",
  appId: "1:215841924706:web:b225b3e320fc34b48a133b",
  measurementId: "G-1CPHY540JH"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const googleProvider = new GoogleAuthProvider();

export const storage = getStorage(app);

export const auth = getAuth(app);
// // export {storage, googleProvider, auth };
