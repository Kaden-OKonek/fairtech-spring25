// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAPpn1jTSj0FQ_HQ3j3ScTWNUBWtGWvFuA",
  authDomain: "fairtechweb-dd440.firebaseapp.com",
  projectId: "fairtechweb-dd440",
  storageBucket: "fairtechweb-dd440.appspot.com",
  messagingSenderId: "4896251289",
  appId: "1:4896251289:web:580a4add8a225d69578708",
  measurementId: "G-RD316T32F5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);