import admin from 'firebase-admin';
import { Logger } from '../utils/logger';

// Initialize Firebase Admin SDK
let firebaseAdmin: admin.app.App | null = null;

export const initializeFirebase = (): void => {
  try {
    // Check if Firebase is already initialized
    const apps = admin.apps;
    if (apps && apps.length > 0) {
      firebaseAdmin = apps[0] as admin.app.App;
      Logger.info('✅ Firebase Admin already initialized');
      return;
    }

    // Get Firebase credentials from environment variables
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    
    if (!projectId) {
      Logger.warn('⚠️  Firebase not configured. Phone authentication will use fallback mode.');
      Logger.warn('   Set VITE_FIREBASE_PROJECT_ID in .env file');
      return;
    }
    
    // Initialize Firebase Admin SDK
    try {
      // In production environments (like Firebase hosting), use default initialization
      // Otherwise, it will use the service account from the environment
      firebaseAdmin = admin.initializeApp({
        projectId: projectId,
      });
    } catch (error) {
      Logger.warn('⚠️  Could not initialize Firebase Admin. Using fallback authentication methods.');
      return;
    }

    Logger.info('✅ Firebase Admin SDK initialized successfully');
    Logger.info(`📦 Project ID: ${projectId}`);
  } catch (error: any) {
    Logger.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    Logger.warn('⚠️  Phone authentication will use fallback mode');
  }
};

export const getFirebaseAdmin = (): admin.app.App | null => {
  return firebaseAdmin;
};

export const verifyIdToken = async (idToken: string): Promise<admin.auth.DecodedIdToken | null> => {
  if (!firebaseAdmin) {
    throw new Error('Firebase Admin not initialized');
  }

  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error: any) {
    Logger.error('Error verifying Firebase ID token:', error.message);
    return null;
  }
};



