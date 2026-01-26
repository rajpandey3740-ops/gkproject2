import { useState } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  User
} from 'firebase/auth';
import { getFirebaseAuth } from '../config/firebase';

export const useFirebaseEmailAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (email: string, password: string, displayName?: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error('Firebase authentication is not initialized');
      }

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Set display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      // Send email verification
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
      }
      
      return {
        success: true,
        user: userCredential.user,
      };
    } catch (err: any) {
      console.error('Error in sign up:', err);
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error('Firebase authentication is not initialized');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      return {
        success: true,
        user: user,
      };
    } catch (err: any) {
      console.error('Error in sign in:', err);
      let errorMessage = 'Failed to sign in. Please try again.';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationEmail = async (user: User): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      
      await sendEmailVerification(user);
      
      return {
        success: true,
      };
    } catch (err: any) {
      console.error('Error sending verification email:', err);
      let errorMessage = 'Failed to send verification email. Please try again.';
      
      if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    sendVerificationEmail,
    loading,
    error,
    clearError: () => setError(null),
  };
};