// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  type Auth,
  GoogleAuthProvider,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPopup, 
  signInWithPhoneNumber,
  onAuthStateChanged 
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
// import { getAnalytics } from "firebase/analytics"; // Optional: if you want to use Analytics

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Log the config to ensure it's loaded correctly
if (typeof window !== 'undefined') { // Log only on the client-side
  console.log("Firebase Config Initializing in firebase.ts:", {
    apiKeyLoaded: firebaseConfig.apiKey ? 'Exists' : 'MISSING or UNDEFINED',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
  });
}

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Error initializing Firebase app:", error);
    // Prevent further Firebase calls if initialization fails
    throw error; 
  }
} else {
  app = getApps()[0];
}

try {
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Error getting Auth or Firestore instance:", error);
  // Depending on the app's needs, you might want to handle this differently
  // For now, rethrow to make it visible.
  throw error;
}


// Optional: Initialize Analytics
// let analytics;
// if (typeof window !== 'undefined') {
//   analytics = getAnalytics(app);
// }

export { 
  app, 
  auth, 
  db, 
  GoogleAuthProvider, 
  PhoneAuthProvider, 
  RecaptchaVerifier, 
  signInWithPopup, 
  signInWithPhoneNumber,
  onAuthStateChanged 
};