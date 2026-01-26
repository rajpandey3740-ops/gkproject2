import React, { useState } from 'react';
import axios from 'axios';
import { useFirebaseEmailAuth } from '../hooks/useFirebaseEmailAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const EmailLogin: React.FC = () => {
  const [step, setStep] = useState<'email' | 'verification' | 'login' | 'reset-request' | 'reset-verify' | 'email-sent'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { signUp, signIn, loading: firebaseLoading } = useFirebaseEmailAuth();

  const handleRequestVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email || !name || !phone) {
      setError("Please enter email, name, and mobile number");
      return;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
        
    if (!/^[0-9]{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    setLoading(true);
    
    try {
      // Create the account in Firebase (this automatically sends verification email)
      const result = await signUp(email, password, name);
      
      if (result.success && result.user) {
        // Save user data to our backend with mobile number
        try {
          await axios.post(`${API_BASE_URL}/auth/email/signup/request-verification`, {
            email,
            name,
            phone,
          });
        } catch (backendError) {
          // If backend fails, it's not critical since Firebase handles auth
          console.warn('Backend user creation failed:', backendError);
        }
        
        setMessage('Verification email sent! Please check your inbox and click the verification link.');
        setStep('email-sent');
      } else {
        // Check if this is an "email already exists" error
        if (result.error && result.error.includes('email-already-in-use')) {
          setError('An account with this email already exists. Please login instead.');
          setStep('login');
        } else {
          setError(result.error || 'Failed to create account');
        }
      }
    } catch (err: any) {
      // Handle Firebase specific errors
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please login instead.');
        setStep('login');
      } else {
        setError(err.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!verificationCode || !password) {
      setError('Please enter verification code and password');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      // In Firebase, email verification is handled by Firebase, not by us
      // The user just needs to sign in after verifying email
      const result = await signIn(email, password);
      
      if (result.success) {
        localStorage.setItem('token', 'firebase_token_placeholder'); // Placeholder for Firebase token
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', result.user?.displayName || name);
        setMessage('Login successful! You are now logged in.');
        
        // Redirect to home page after successful verification
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setError(result.error || 'Email verification failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Email verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await signIn(email, password);
      
      if (result.success && result.user) {
        // Check if email is verified
        await result.user.reload(); // Refresh user data
        
        if (!result.user.emailVerified) {
          setError('Please verify your email address first. Check your inbox for the verification email.');
          setStep('email-sent');
          return;
        }
        
        // Get the ID token for backend authentication
        const idToken = await result.user.getIdToken();
        
        // Send token to backend for session management
        const response = await axios.post(`${API_BASE_URL}/auth/firebase/verify-email`, {
          idToken
        });
        
        if (response.data.success) {
          localStorage.setItem('token', response.data.data.token);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('username', response.data.data.user.name);
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userPhone', phone);
          setMessage('Login successful!');
          
          // Redirect to home page after successful login
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          setError(response.data.error || 'Login failed');
        }
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/email/password-reset/request`, {
        email,
      });
      
      if (response.data.success) {
        setStep('reset-verify');
        setMessage(response.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!resetCode || !newPassword) {
      setError('Please enter reset code and new password');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/email/password-reset/verify`, {
        email,
        resetCode,
        newPassword,
      });
      
      if (response.data.success) {
        setMessage(response.data.message);
        setStep('login');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('email');
    setError('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">
            {step === 'email' && 'Email Authentication'}
            {step === 'verification' && 'Verify Your Email'}
            {step === 'login' && 'Login with Email'}
            {step === 'reset-request' && 'Reset Password'}
            {step === 'reset-verify' && 'Set New Password'}
            {step === 'email-sent' && 'Email Verification Sent'}
          </h2>
          <p className="text-gray-500 mt-2">
            {step === 'email' && 'Create account or login with email'}
            {step === 'verification' && 'Enter the code sent to your email'}
            {step === 'login' && 'Enter your credentials to login'}
            {step === 'reset-request' && 'Enter your email to reset password'}
            {step === 'reset-verify' && 'Enter reset code and new password'}
            {step === 'email-sent' && 'Please verify your email before continuing'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            <i className="fas fa-check-circle mr-2"></i>
            {message}
          </div>
        )}

        {/* Email Entry Step */}
        {step === 'email' && (
          <div className="space-y-4">
            <button
              onClick={() => setStep('verification')}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Create New Account
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            
            <button
              onClick={() => setStep('login')}
              className="w-full py-3 px-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Login with Existing Account
            </button>
            
            <button
              onClick={() => setStep('reset-request')}
              className="w-full py-3 px-4 border-2 border-gray-400 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Forgot Password?
            </button>
          </div>
        )}

        {/* Registration Form */}
        {step === 'verification' && (
          <form onSubmit={handleRequestVerification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your 10-digit mobile number"
                required
                maxLength={10}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Create a password (min 6 characters)"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-.707.707m1.414 0l.707-.707m0 1.414l-.707.707" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || firebaseLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading || firebaseLoading ? 'Sending...' : 'Send Verification Email'}
            </button>
            
            <button
              type="button"
              onClick={handleBack}
              className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Back to Options
            </button>
          </form>
        )}

        {/* Verification Code Entry */}
        {step === 'verification' && (
          <form onSubmit={handleVerifyEmail} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Create a password (min 6 characters)"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-.707.707m1.414 0l.707-.707m0 1.414l-.707.707" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6 || password.length < 6}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Complete Registration'}
            </button>
          </form>
        )}

        {/* Login Form */}
        {step === 'login' && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-.707.707m1.414 0l.707-.707m0 1.414l-.707.707" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || firebaseLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading || firebaseLoading ? 'Logging in...' : 'Login'}
            </button>
            
            <button
              type="button"
              onClick={handleBack}
              className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Back to Options
            </button>
          </form>
        )}

        {/* Email Sent Confirmation */}
        {step === 'email-sent' && (
          <div className="space-y-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Check Your Email</h3>
              <p className="text-gray-600">We've sent a verification email to <strong>{email}</strong>. Please check your inbox (and spam folder) and click the verification link to activate your account.</p>
              <p className="text-gray-500 text-sm mt-2">After verification, you can login with your email and password.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setStep('login')}
                className="py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Continue to Login
              </button>
              <button
                onClick={handleBack}
                className="py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Back to Signup
              </button>
            </div>
          </div>
        )}

        {/* Password Reset Request */}
        {step === 'reset-request' && (
          <form onSubmit={handleRequestPasswordReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
            
            <button
              type="button"
              onClick={handleBack}
              className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Back to Options
            </button>
          </form>
        )}

        {/* Password Reset Verification */}
        {step === 'reset-verify' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reset Code
              </label>
              <input
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Enter new password (min 6 characters)"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-.707.707m1.414 0l.707-.707m0 1.414l-.707.707" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || resetCode.length !== 6 || newPassword.length < 6}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            
            <button
              type="button"
              onClick={() => setStep('reset-request')}
              className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Resend Code
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmailLogin;