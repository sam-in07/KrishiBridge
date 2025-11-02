// src/firebase/firebase.config.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJbCm1CGfNl1RMpUdeJVbelfObgPp2rEQ",
  authDomain: "krishi-bridge.firebaseapp.com",
  projectId: "krishi-bridge",
  storageBucket: "krishi-bridge.appspot.com",
  messagingSenderId: "944020383174",
  appId: "1:944020383174:web:6b4321fd63004e272cbec7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication instance
export const auth = getAuth(app);

// Google authentication provider
export const googleProvider = new GoogleAuthProvider();
