// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQIHhsjpYKHFCz-iHckfEr1xueDF7suvU",
  authDomain: "projectecho-b819b.firebaseapp.com",
  projectId: "projectecho-b819b",
  storageBucket: "projectecho-b819b.appspot.com",
  messagingSenderId: "228243850955",
  appId: "1:228243850955:web:9d955206867942e6e6bd4e",
  measurementId: "G-39E5FRSC7V"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
