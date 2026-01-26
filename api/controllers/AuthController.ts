import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import UserModel, { IUser } from '../models/UserModel';
import { OTPService } from '../services/OTPService';
import { FirebaseAuthService } from '../services/FirebaseAuthService';
import { EmailService } from '../services/EmailService';
import { Logger } from '../utils/logger';
import { getFirebaseAdmin } from '../config/firebase';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY: string = process.env.JWT_EXPIRY || '7d';

export class AuthController {
  /**
   * Request OTP for signup
   */
  async requestSignupOTP(req: Request, res: Response): Promise<Response> {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({
          success: false,
          error: 'Phone number is required',
        });
      }

      // Validate phone number format (10 digits)
      if (!/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid 10-digit phone number',
        });
      }

      // Check if user already exists
      const existingUser = await UserModel.findOne({ phone });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User with this phone number already exists. Please login instead.',
        });
      }

      // Generate and send OTP
      const otpResult = await OTPService.requestOTP(phone);

      if (!otpResult.success) {
        return res.status(500).json({
          success: false,
          error: otpResult.message,
        });
      }

      return res.json({
        success: true,
        message: `OTP sent to ${phone}`,
        ...(otpResult.otp && { otp: otpResult.otp }), // Only in development
      });
    } catch (error: any) {
      Logger.error('Request signup OTP error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to send OTP',
        message: error.message,
      });
    }
  }

  /**
   * Register a new user with OTP verification
   */
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const { name, phone, password, otp } = req.body;

      // Validation
      if (!name || !phone || !password || !otp) {
        return res.status(400).json({
          success: false,
          error: 'All fields are required (name, phone, password, otp)',
        });
      }

      // Validate phone number format
      if (!/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid 10-digit phone number',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long',
        });
      }

      // Verify OTP first
      const otpVerification = OTPService.verifyOTP(phone, otp);

      if (!otpVerification.valid) {
        return res.status(400).json({
          success: false,
          error: otpVerification.message,
        });
      }

      // Check if user already exists (double check)
      const existingUser = await UserModel.findOne({ phone });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User with this phone number already exists',
        });
      }

      // Create new user
      const user = new UserModel({
        name,
        phone,
        password,
        isVerified: true, // Verified via OTP
      });

      await user.save();

      // Generate JWT token
      let token: string;
      try {
        const payload = {
          userId: (user._id as any).toString(),
          phone: user.phone,
        };
        token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY } as jwt.SignOptions);
      } catch (error) {
        Logger.error('JWT signing failed:', error);
        return res.status(500).json({
          success: false,
          error: 'Token generation failed',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'User registered successfully and verified.',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            phone: user.phone,
            isVerified: user.isVerified,
          },
        },
      });
    } catch (error: any) {
      Logger.error('Registration error:', error);
      
      // Handle duplicate phone number error
      if (error.code === 11000 || error.keyPattern?.phone) {
        return res.status(400).json({
          success: false,
          error: 'Phone number already registered. Please login instead.',
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Registration failed',
        message: error.message,
      });
    }
  }

  /**
   * Request OTP for login
   */
  async requestLoginOTP(req: Request, res: Response): Promise<Response> {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({
          success: false,
          error: 'Phone number is required',
        });
      }

      // Validate phone number format
      if (!/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid 10-digit phone number',
        });
      }

      // Find user by phone
      const user = await UserModel.findOne({ phone });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found. Please sign up first.',
        });
      }

      // Generate and send OTP
      const otpResult = await OTPService.requestOTP(phone);

      if (!otpResult.success) {
        return res.status(500).json({
          success: false,
          error: otpResult.message,
        });
      }

      return res.json({
        success: true,
        message: `OTP sent to ${phone}`,
        ...(otpResult.otp && { otp: otpResult.otp }), // Only in development
      });
    } catch (error: any) {
      Logger.error('Request login OTP error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to send OTP',
        message: error.message,
      });
    }
  }

  /**
   * Verify OTP and login
   */
  async verifyOTPAndLogin(req: Request, res: Response): Promise<Response> {
    try {
      const { phone, otp } = req.body;

      if (!phone || !otp) {
        return res.status(400).json({
          success: false,
          error: 'Phone number and OTP are required',
        });
      }

      // Validate phone number format
      if (!/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid 10-digit phone number',
        });
      }

      // Find user
      const user = await UserModel.findOne({ phone });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Verify OTP
      const otpVerification = OTPService.verifyOTP(phone, otp);

      if (!otpVerification.valid) {
        return res.status(400).json({
          success: false,
          error: otpVerification.message,
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: (user._id as any).toString(),
          phone: user.phone,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY } as jwt.SignOptions
      );

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            phone: user.phone,
            isVerified: user.isVerified,
          },
        },
      });
    } catch (error: any) {
      Logger.error('OTP verification error:', error);
      return res.status(500).json({
        success: false,
        error: 'OTP verification failed',
        message: error.message,
      });
    }
  }

  /**
   * Verify Firebase ID token and login/register
   */
  async verifyFirebaseToken(req: Request, res: Response): Promise<Response> {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({
          success: false,
          error: 'Firebase ID token is required',
        });
      }

      // Verify Firebase ID token
      const verification = await FirebaseAuthService.verifyIdToken(idToken);

      if (!verification.success || !verification.phone) {
        return res.status(401).json({
          success: false,
          error: verification.error || 'Invalid Firebase token',
        });
      }

      // Extract phone number (remove country code for storage)
      const phone = verification.phone.replace(/^\+91/, '');

      // Find or create user
      let user = await UserModel.findOne({ phone });

      if (!user) {
        // Create new user if doesn't exist
        user = new UserModel({
          name: `User ${phone.slice(-4)}`, // Default name
          phone,
          password: '', // No password needed with Firebase Auth
          isVerified: true,
        });
        await user.save();
        Logger.info(`New user created via Firebase: ${phone}`);
      } else {
        // Update verification status
        user.isVerified = true;
        await user.save();
      }

      // Generate JWT token for our system
      const token = jwt.sign(
        {
          userId: (user._id as any).toString(),
          phone: user.phone,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY } as jwt.SignOptions
      );

      return res.json({
        success: true,
        message: 'Authentication successful',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            phone: user.phone,
            isVerified: user.isVerified,
          },
        },
      });
    } catch (error: any) {
      Logger.error('Firebase token verification error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authentication failed',
        message: error.message,
      });
    }
  }
  
  /**
   * Verify Firebase ID token for email authentication and login/register
   */
  async verifyFirebaseEmailToken(req: Request, res: Response): Promise<Response> {
    try {
      const { idToken } = req.body;
  
      if (!idToken) {
        return res.status(400).json({
          success: false,
          error: 'Firebase ID token is required',
        });
      }
  
      // Verify Firebase ID token
      const firebaseAdmin = getFirebaseAdmin();
      if (!firebaseAdmin) {
        return res.status(500).json({
          success: false,
          error: 'Firebase Admin not initialized',
        });
      }
  
      let decodedToken;
      try {
        decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      } catch (error: any) {
        Logger.error('Firebase ID token verification failed:', error.message);
        return res.status(401).json({
          success: false,
          error: 'Invalid Firebase token',
        });
      }
  
      // Extract email and display name from Firebase token
      const email = decodedToken.email;
      const name = decodedToken.name || decodedToken.displayName || `User ${decodedToken.uid.substring(0, 4)}`;
      const emailVerified = decodedToken.email_verified || false;
  
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email not found in Firebase token',
        });
      }
  
      // Find or create user
      let user = await UserModel.findOne({ email });
      
      if (!user) {
        // Create new user if doesn't exist
        user = new UserModel({
          name,
          email,
          password: '', // No password needed with Firebase Auth
          isVerified: emailVerified,
          emailVerified: emailVerified,
        });
        await user.save();
        Logger.info(`New user created via Firebase email: ${email}`);
      } else {
        // Update user info if needed
        user.name = name;
        user.isVerified = emailVerified;
        user.emailVerified = emailVerified;
        await user.save();
      }
  
      const token = jwt.sign(
        {
          userId: (user._id as any).toString(),
          email: user.email,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY } as jwt.SignOptions
      );
  
      return res.json({
        success: true,
        message: 'Authentication successful',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            isVerified: user.isVerified,
          },
        },
      });
    } catch (error: any) {
      Logger.error('Firebase email token verification error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authentication failed',
        message: error.message,
      });
    }
  }
  
  /**
   * Traditional login with phone and password
   */
  async traditionalLogin(req: Request, res: Response): Promise<Response> {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({
          success: false,
          error: 'Phone number and password are required',
        });
      }

      // Validate phone number format
      if (!/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid 10-digit phone number',
        });
      }

      // Find user by phone
      const user = await UserModel.findOne({ phone }).select('+password');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found. Please sign up first.',
        });
      }

      // Check if user has a password (users created via OTP/Firebase might not have one)
      if (!user.password) {
        return res.status(400).json({
          success: false,
          error: 'This account uses phone verification. Please use the OTP login method.',
        });
      }

      // Compare password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: (user._id as any).toString(),
          phone: user.phone,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY } as jwt.SignOptions
      );

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            phone: user.phone,
            isVerified: user.isVerified,
          },
        },
      });
    } catch (error: any) {
      Logger.error('Traditional login error:', error);
      return res.status(500).json({
        success: false,
        error: 'Login failed',
        message: error.message,
      });
    }
  }

  /**
   * Request OTP for password reset
   */
  async requestPasswordResetOTP(req: Request, res: Response): Promise<Response> {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({
          success: false,
          error: 'Phone number is required',
        });
      }

      // Validate phone number format
      if (!/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid 10-digit phone number',
        });
      }

      // Find user by phone
      const user = await UserModel.findOne({ phone });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found. Please check your phone number.',
        });
      }

      // Generate and send OTP
      const otpResult = await OTPService.requestOTP(phone);

      if (!otpResult.success) {
        return res.status(500).json({
          success: false,
          error: otpResult.message,
        });
      }

      return res.json({
        success: true,
        message: `Password reset OTP sent to ${phone}`,
        ...(otpResult.otp && { otp: otpResult.otp }), // Only in development
      });
    } catch (error: any) {
      Logger.error('Request password reset OTP error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to send password reset OTP',
        message: error.message,
      });
    }
  }

  /**
   * Reset password with OTP verification
   */
  async resetPasswordWithOTP(req: Request, res: Response): Promise<Response> {
    try {
      const { phone, otp, newPassword } = req.body;

      if (!phone || !otp || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Phone number, OTP, and new password are required',
        });
      }

      // Validate phone number format
      if (!/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid 10-digit phone number',
        });
      }

      // Validate password length
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long',
        });
      }

      // Verify OTP first
      const otpVerification = OTPService.verifyOTP(phone, otp);

      if (!otpVerification.valid) {
        return res.status(400).json({
          success: false,
          error: otpVerification.message,
        });
      }

      // Find user by phone
      const user = await UserModel.findOne({ phone });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Update user's password
      user.password = newPassword;
      await user.save();

      return res.json({
        success: true,
        message: 'Password reset successful. You can now login with your new password.',
      });
    } catch (error: any) {
      Logger.error('Password reset error:', error);
      return res.status(500).json({
        success: false,
        error: 'Password reset failed',
        message: error.message,
      });
    }
  }

  /**
   * Request email verification for signup
   */
  async requestEmailVerification(req: Request, res: Response): Promise<Response> {
    try {
      const { email, name, phone } = req.body;

      if (!email || !name || !phone) {
        return res.status(400).json({
          success: false,
          error: 'Email, name, and mobile number are required',
        });
      }

      // Validate email format
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid email address',
        });
      }

      // Validate phone number format
      if (!/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid 10-digit phone number',
        });
      }

      // Check if user already exists
      const existingUser = await UserModel.findOne({ email });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User with this email already exists. Please login instead.',
        });
      }

      // Create temporary user with verification code
      const user = new UserModel({
        name,
        email,
        phone,
        password: 'temp_' + Math.random().toString(36).substring(2, 15), // Temporary password to satisfy validation
        isVerified: false,
        emailVerified: false,
      });

      const verificationCode = user.generateVerificationCode();
      await user.save();

      // For Firebase-only approach, we'll let the frontend handle email verification
      // Just create the user in our database
      Logger.info(`User registered with email: ${email}. Email verification will be handled by Firebase client SDK.`);

      // Skip email sending since we're using Firebase-only approach
      // Email verification is handled by Firebase client SDK
      Logger.info(`Skipping email service - using Firebase client SDK for verification`);

      return res.json({
        success: true,
        message: `Verification code sent to ${email}`,
        email: email,
        ...(process.env.NODE_ENV === 'development' && { code: verificationCode }), // Only in development
      });
    } catch (error: any) {
      Logger.error('Request email verification error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to send verification email',
        message: error.message,
      });
    }
  }

  /**
   * Verify email and complete registration
   */
  async verifyEmailAndRegister(req: Request, res: Response): Promise<Response> {
    try {
      const { email, verificationCode, password } = req.body;

      if (!email || !verificationCode || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email, verification code, and password are required',
        });
      }

      // Validate email format
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid email address',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long',
        });
      }

      // Find user by email
      const user = await UserModel.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found. Please request verification first.',
        });
      }

      // Verify the code
      const isValid = user.verifyEmailCode(verificationCode);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired verification code',
        });
      }

      // Set password and save
      user.password = password;
      user.isVerified = true;
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: (user._id as any).toString(),
          email: user.email,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY } as jwt.SignOptions
      );

      return res.status(201).json({
        success: true,
        message: 'Email verified and registration completed successfully.',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
          },
        },
      });
    } catch (error: any) {
      Logger.error('Email verification error:', error);
      return res.status(500).json({
        success: false,
        error: 'Email verification failed',
        message: error.message,
      });
    }
  }

  /**
   * Traditional email and password login
   */
  async emailLogin(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required',
        });
      }

      // Validate email format
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid email address',
        });
      }

      // Find user by email
      const user = await UserModel.findOne({ email }).select('+password');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found. Please sign up first.',
        });
      }

      // Check if email is verified
      if (!user.emailVerified) {
        return res.status(400).json({
          success: false,
          error: 'Please verify your email address first.',
        });
      }

      // Compare password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: (user._id as any).toString(),
          email: user.email,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY } as jwt.SignOptions
      );

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
          },
        },
      });
    } catch (error: any) {
      Logger.error('Email login error:', error);
      return res.status(500).json({
        success: false,
        error: 'Login failed',
        message: error.message,
      });
    }
  }

  /**
   * Request password reset via email
   */
  async requestEmailPasswordReset(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required',
        });
      }

      // Validate email format
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid email address',
        });
      }

      // Find user by email
      const user = await UserModel.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found. Please check your email address.',
        });
      }

      // Generate reset password code
      const resetCode = user.generateResetPasswordCode();
      await user.save();

      // Send password reset email
      const emailSent = await EmailService.sendPasswordResetEmail(email, user.name, resetCode);

      if (!emailSent) {
        return res.status(500).json({
          success: false,
          error: 'Failed to send password reset email. Please try again.',
        });
      }

      return res.json({
        success: true,
        message: `Password reset code sent to ${email}`,
        email: email,
        ...(process.env.NODE_ENV === 'development' && { code: resetCode }), // Only in development
      });
    } catch (error: any) {
      Logger.error('Request email password reset error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to send password reset email',
        message: error.message,
      });
    }
  }

  /**
   * Reset password with email verification code
   */
  async resetPasswordWithEmail(req: Request, res: Response): Promise<Response> {
    try {
      const { email, resetCode, newPassword } = req.body;

      if (!email || !resetCode || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Email, reset code, and new password are required',
        });
      }

      // Validate email format
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid email address',
        });
      }

      // Validate password length
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long',
        });
      }

      // Find user by email
      const user = await UserModel.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Verify reset code
      const isValid = user.verifyResetPasswordCode(resetCode);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired reset code',
        });
      }

      // Update password
      user.password = newPassword;
      user.clearResetPasswordCode();
      await user.save();

      return res.json({
        success: true,
        message: 'Password reset successful. You can now login with your new password.',
      });
    } catch (error: any) {
      Logger.error('Password reset error:', error);
      return res.status(500).json({
        success: false,
        error: 'Password reset failed',
        message: error.message,
      });
    }
  }

  /**
   * Verify user token (middleware helper)
   */
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET as jwt.Secret);
    } catch (error) {
      return null;
    }
  }

  /**
   * Owner login authentication
   */
  async ownerLogin(req: Request, res: Response): Promise<Response> {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({
          success: false,
          error: 'Phone number and password are required',
        });
      }

      // Get owner credentials from environment variables
      const ownerPhone = process.env.OWNER_PHONE;
      const ownerPassword = process.env.OWNER_PASSWORD;

      if (!ownerPhone || !ownerPassword) {
        Logger.error('Owner credentials not configured in environment variables');
        return res.status(500).json({
          success: false,
          error: 'Owner credentials not configured',
        });
      }

      // Compare with environment variables
      if (phone === ownerPhone && password === ownerPassword) {
        // Generate JWT token for owner
        const token = jwt.sign(
          {
            userId: 'owner',
            role: 'owner',
            phone: ownerPhone,
          },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRY } as jwt.SignOptions
        );

        return res.json({
          success: true,
          message: 'Owner login successful',
          data: {
            token,
            user: {
              id: 'owner',
              phone: ownerPhone,
              role: 'owner',
            },
          },
        });
      } else {
        return res.status(401).json({
          success: false,
          error: 'Invalid owner credentials',
        });
      }
    } catch (error: any) {
      Logger.error('Owner login error:', error);
      return res.status(500).json({
        success: false,
        error: 'Owner login failed',
        message: error.message,
      });
    }
  }
}