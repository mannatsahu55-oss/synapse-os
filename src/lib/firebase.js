import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app;
let auth;
let isFirebaseMocked = false;

try {
  if (!firebaseConfig.apiKey) {
    throw new Error("VITE_FIREBASE_API_KEY is not defined");
  }
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log("Firebase Config Loaded and Initialized Successfully");
} catch (error) {
  console.warn("Firebase failed to initialize. Falling back to Mocked Auth mode.", error.message);
  isFirebaseMocked = true;
  app = null;
  auth = {
    currentUser: null
  };
}

export { app, auth, isFirebaseMocked };
