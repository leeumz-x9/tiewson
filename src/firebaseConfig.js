// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection } from 'firebase/firestore'; // เพิ่ม collection
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBniaY78773XHdE0g52tP0rPAeab0mZGGU",
  authDomain: "tiewson-eceee.firebaseapp.com",
  projectId: "tiewson-eceee",
  storageBucket: "tiewson-eceee.firebasestorage.app",
  messagingSenderId: "475652146978",
  appId: "1:475652146978:web:29f605312bd482e3d8877b",
  measurementId: "G-6WP7J32GMS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Services
export const db = getFirestore(app);
export const storage = getStorage(app);

// เพิ่มบรรทัดนี้ ⬇️
export const advertisementsRef = collection(db, 'advertisements');

export default app;