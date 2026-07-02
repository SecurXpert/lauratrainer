// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBII7-Y5LKrCxngZM7AVlG1kiL4x06W4_I",
  authDomain: "laurainstructor-80d89.firebaseapp.com",
  projectId: "laurainstructor-80d89",
  storageBucket: "laurainstructor-80d89.firebasestorage.app",
  messagingSenderId: "537218215561",
  appId: "1:537218215561:web:c0f1483de305c6f1676058",
  measurementId: "G-5E19RDHC8M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
