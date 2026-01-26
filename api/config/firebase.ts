import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

// Initialize Firebase Admin SDK
let firebaseAdmin: admin.app.App | null = null;

export const initializeFirebase = (): void => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      firebaseAdmin = admin.apps[0] as admin.app.App;
      logger.info('✅ Firebase Admin already initialized');
      return;
    }

    // Get Firebase credentials from environment variables
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
    
    if (!projectId) {
      logger.warn('⚠️  Firebase not configured. Phone authentication will use fallback mode.');
      logger.warn('   Set VITE_FIREBASE_PROJECT_ID in .env file');
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
      logger.warn('⚠️  Could not initialize Firebase Admin. Using fallback authentication methods.');
      return;
    }

    logger.info('✅ Firebase Admin SDK initialized successfully');
    logger.info(`📦 Project ID: ${projectId}`);
  } catch (error: any) {
    logger.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    logger.warn('⚠️  Phone authentication will use fallback mode');
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
    logger.error('Error verifying Firebase ID token:', error.message);
    return null;
  }
};



