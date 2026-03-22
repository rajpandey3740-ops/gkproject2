import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const authRouter = Router();
const authController = new AuthController();

// Test route
authRouter.get('/test', (_, res) => {
  res.json({ success: true, message: 'Auth routes are working' });
});

// POST /api/auth/login/request-otp - Request OTP for login
authRouter.post('/login/request-otp', (req, res) => authController.requestLoginOTP(req, res));

// POST /api/auth/login/verify-otp - Verify OTP and login
authRouter.post('/login/verify-otp', (req, res) => authController.verifyOTPAndLogin(req, res));

// POST /api/auth/firebase/verify - Verify Firebase ID token
authRouter.post('/firebase/verify', (req, res) => authController.verifyFirebaseToken(req, res));

// POST /api/auth/firebase/verify-email - Verify Firebase ID token for email authentication
authRouter.post('/firebase/verify-email', (req, res) => authController.verifyFirebaseEmailToken(req, res));

// POST /api/auth/signup/request-otp - Request OTP for signup (must be before /signup)
authRouter.post('/signup/request-otp', (req, res) => authController.requestSignupOTP(req, res));

// POST /api/auth/signup - Register a new user with OTP verification
authRouter.post('/signup', (req, res) => authController.register(req, res));

// POST /api/auth/login/traditional - Traditional phone and password login
authRouter.post('/login/traditional', (req, res) => authController.traditionalLogin(req, res));

// POST /api/auth/password-reset/request-otp - Request OTP for password reset
authRouter.post('/password-reset/request-otp', (req, res) => authController.requestPasswordResetOTP(req, res));

// POST /api/auth/password-reset/verify-otp - Verify OTP and reset password
authRouter.post('/password-reset/verify-otp', (req, res) => authController.resetPasswordWithOTP(req, res));

// Email Authentication Routes

// POST /api/auth/email/signup/request-verification - Request email verification for signup
authRouter.post('/email/signup/request-verification', (req, res) => authController.requestEmailVerification(req, res));

// POST /api/auth/email/signup/verify - Verify email and complete registration
authRouter.post('/email/signup/verify', (req, res) => authController.verifyEmailAndRegister(req, res));

// POST /api/auth/email/login - Email and password login
authRouter.post('/email/login', (req, res) => authController.emailLogin(req, res));

// POST /api/auth/email/password-reset/request - Request password reset via email
authRouter.post('/email/password-reset/request', (req, res) => authController.requestEmailPasswordReset(req, res));

// POST /api/auth/email/password-reset/verify - Verify reset code and reset password
authRouter.post('/email/password-reset/verify', (req, res) => authController.resetPasswordWithEmail(req, res));

// POST /api/auth/owner/login - Owner login authentication
authRouter.post('/owner/login', (req, res) => authController.ownerLogin(req, res));

export default authRouter;

