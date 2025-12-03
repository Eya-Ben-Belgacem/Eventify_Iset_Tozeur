// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJS-IcZYIBt3MaQc_SxxhQXLnApathFPU",
  authDomain: "eventify-iset-tozeur.firebaseapp.com",
  projectId: "eventify-iset-tozeur",
  storageBucket: "eventify-iset-tozeur.firebasestorage.app",
  messagingSenderId: "741497211694",
  appId: "1:741497211694:web:d5915f5516b6e856c408bf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { firebaseConfig };