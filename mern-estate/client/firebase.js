// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-916c4.firebaseapp.com",
  projectId: "mern-estate-916c4",
  storageBucket: "mern-estate-916c4.firebasestorage.app",
  messagingSenderId: "539195053454",
  appId: "1:539195053454:web:07c023ebcb23f49707c0df"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);