import { getFirebaseAdmin } from '../config/firebase';
import { Logger } from '../utils/logger';
import * as admin from 'firebase-admin';

export class FirebaseAuthService {
  /**
   * Verify Firebase ID token from client
   */
  static async verifyIdToken(idToken: string): Promise<{
    success: boolean;
    uid?: string;
    phone?: string;
    error?: string;
  }> {
    try {
      const firebaseAdmin = getFirebaseAdmin();
      
      if (!firebaseAdmin) {
        return {
          success: false,
          error: 'Firebase Admin not initialized',
        };
      }

      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      
      return {
        success: true,
        uid: decodedToken.uid,
        phone: decodedToken.phone_number,
      };
    } catch (error: any) {
      Logger.error('Firebase ID token verification failed:', error.message);
      return {
        success: false,
        error: error.message || 'Invalid token',
      };
    }
  }

  /**
   * Get user by phone number
   */
  static async getUserByPhone(phone: string): Promise<admin.auth.UserRecord | null> {
    try {
      const firebaseAdmin = getFirebaseAdmin();
      
      if (!firebaseAdmin) {
        return null;
      }

      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phone);
      
      // Get user by phone number
      const user = await firebaseAdmin.auth().getUserByPhoneNumber(formattedPhone);
      return user;
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return null;
      }
      Logger.error('Error getting user by phone:', error.message);
      return null;
    }
  }

  /**
   * Create custom token for user (for testing/admin purposes)
   */
  static async createCustomToken(uid: string, additionalClaims?: object): Promise<string | null> {
    try {
      const firebaseAdmin = getFirebaseAdmin();
      
      if (!firebaseAdmin) {
        return null;
      }

      const customToken = await firebaseAdmin.auth().createCustomToken(uid, additionalClaims);
      return customToken;
    } catch (error: any) {
      Logger.error('Error creating custom token:', error.message);
      return null;
    }
  }

  /**
   * Format phone number for Firebase (adds country code)
   */
  static formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If already has country code, return with +
    if (cleaned.length > 10) {
      return `+${cleaned}`;
    }
    
    // For 10-digit Indian numbers, add +91
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    
    return phone;
  }

  /**
   * Check if Firebase is configured
   */
  static isConfigured(): boolean {
    return getFirebaseAdmin() !== null;
  }
}



