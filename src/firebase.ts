import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB2ZVDOiDhKXKOQa8ddrptrTWZJPUWRDbA",
  authDomain: "awsquiz-18b6d.firebaseapp.com",
  projectId: "awsquiz-18b6d",
  storageBucket: "awsquiz-18b6d.firebasestorage.app",
  messagingSenderId: "64994463486",
  appId: "1:64994463486:web:1bb3d8e1e2a02a6fb0dfaf",
  measurementId: "G-NC20RJ5B6V"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);