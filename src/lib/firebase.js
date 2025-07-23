import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDGozAojFjJ1ZtJozNUWGsTjgjVc1ULG-c",
  authDomain: "service-desk-app-91d06.firebaseapp.com",
  projectId: "service-desk-app-91d06",
  storageBucket: "service-desk-app-91d06.firebasestorage.app",
  messagingSenderId: "120951863508",
  appId: "1:120951863508:web:e85d4b74470a55ff0de341",
  measurementId: "G-VT8DQC2YS8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;