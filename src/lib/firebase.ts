import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCKS3tXA-FWJ5LgBpYNJbtbw1kh5VVKzjc",
  authDomain: "sahayak-u279c.firebaseapp.com",
  projectId: "sahayak-u279c",
  storageBucket: "sahayak-u279c.firebasestorage.app",
  messagingSenderId: "1037126053921",
  appId: "1:1037126053921:web:4abdb69a3e47b546347360",
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
