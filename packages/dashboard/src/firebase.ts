import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAc-3zSMyogaOWasjRbZaWOsSzpeeKYzyg",
  authDomain: "conversiontrackerpro.firebaseapp.com",
  projectId: "conversiontrackerpro",
  storageBucket: "conversiontrackerpro.firebasestorage.app",
  messagingSenderId: "346263347045",
  appId: "1:346263347045:web:67e494abdf1a40c7114b8c",
  measurementId: "G-EZPEEQQPRW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 