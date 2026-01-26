// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWbW_pfk9B-juxtH01Qqd7hNJW9G1of08",
  authDomain: "gk-store-a3365.firebaseapp.com",
  projectId: "gk-store-a3365",
  storageBucket: "gk-store-a3365.firebasestorage.app",
  messagingSenderId: "36277072139",
  appId: "1:36277072139:web:b48a7087adf487d032b20e",
};

export default firebaseConfig;

// Initialize Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export const initializeFirebase = (): { app: FirebaseApp; auth: Auth } | null => {
  // Check if Firebase is already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
    auth = getAuth(app);
    return { app, auth };
  }

  // Check if config is available
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('⚠️  Firebase not configured. Phone authentication will use fallback mode.');
    console.warn('   Set Firebase environment variables (VITE_FIREBASE_*)');
    return null;
  }

  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log('✅ Firebase initialized successfully');
    return { app, auth };
  } catch (error: any) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    return null;
  }
};

export const getFirebaseAuth = (): Auth | null => {
  if (!auth) {
    const init = initializeFirebase();
    return init?.auth || null;
  }
  return auth;
};

export const getFirebaseApp = (): FirebaseApp | null => {
  if (!app) {
    const init = initializeFirebase();
    return init?.app || null;
  }
  return app;
};

