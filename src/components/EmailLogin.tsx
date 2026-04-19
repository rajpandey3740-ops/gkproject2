import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useFirebaseEmailAuth } from '../hooks/useFirebaseEmailAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const EmailLogin: React.FC = () => {
  const [step, setStep] = useState<'email' | 'verification' | 'login' | 'reset-request' | 'reset-verify' | 'email-sent'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { signUp, signIn, loading: firebaseLoading } = useFirebaseEmailAuth();

  const handleBack = () => {
    setStep('email');
    setError('');
    setMessage('');
  };

  const handleRequestVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setError('Please provide a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(email, password, name);
      if (result.success) {
        setStep('email-sent');
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const result = await signIn(email, password);
      if (result.success) {
        window.location.href = '/';
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/email/password-reset/request`, { email });
      if (response.data.success) {
        setStep('reset-verify');
        setMessage('Reset code sent to your email');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/email/password-reset/verify`, { 
        email, 
        resetCode, 
        newPassword 
      });
      if (response.data.success) {
        setMessage('Password reset successful! You can now login.');
        setTimeout(() => setStep('login'), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 transition-all duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-100">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 'email' && 'Create Account'}
            {step === 'verification' && 'Join GK Shop'}
            {step === 'login' && 'Welcome Back'}
            {step === 'reset-request' && 'Reset Password'}
            {step === 'reset-verify' && 'Set New Password'}
            {step === 'email-sent' && 'Verify Your Email'}
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            {step === 'email' && 'Choose an option to continue'}
            {step === 'verification' && 'Fill in your details to get started'}
            {step === 'login' && 'Enter your credentials to login'}
            {step === 'reset-request' && 'Enter your email to reset password'}
            {step === 'reset-verify' && 'Enter reset code and new password'}
            {step === 'email-sent' && 'We\'ve sent a link to your inbox'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-700 text-sm animate-shake">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl text-green-700 text-sm animate-fade-in">
            <div className="flex items-center">
              <i className="fas fa-check-circle mr-2"></i>
              {message}
            </div>
          </div>
        )}

        {/* Email Entry Step */}
        {step === 'email' && (
          <div className="space-y-4">
            <button
              onClick={() => setStep('verification')}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-50 hover:bg-blue-700 transition-all active:scale-[0.98]"
            >
              Create New Account
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Already have an account?</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>
            
            <button
              onClick={() => setStep('login')}
              className="w-full py-3.5 border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all active:scale-[0.98]"
            >
              Login Instead
            </button>
            
            <button
              onClick={() => setStep('reset-request')}
              className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-semibold transition-all"
            >
              Forgot Password?
            </button>
          </div>
        )}

        {/* Registration Form */}
        {step === 'verification' && (
          <form onSubmit={handleRequestVerification} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <i className="fas fa-user"></i>
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="Your Name"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <i className="fas fa-envelope"></i>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="email@example.com"
                  required
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 ml-1">* Mandatory for email OTP verification</p>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <i className="fas fa-phone"></i>
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="10-digit mobile number"
                  required
                  maxLength={10}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 ml-1">* Mandatory 10-digit valid number</p>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="Min 6 characters"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || firebaseLoading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-50 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading || firebaseLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleBack}
              className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-semibold transition-all"
            >
              ← Back to Options
            </button>
          </form>
        )}

        {/* Login Form */}
        {step === 'login' && (
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <i className="fas fa-envelope"></i>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || firebaseLoading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-50 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading || firebaseLoading ? 'Logging in...' : 'Login'}
            </button>
            
            <button
              type="button"
              onClick={handleBack}
              className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-semibold transition-all"
            >
              ← Back to Options
            </button>
          </form>
        )}

        {/* Email Sent Confirmation */}
        {step === 'email-sent' && (
          <div className="space-y-6">
            <div className="text-center p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <i className="fas fa-envelope-open-text text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We've sent a verification link to <br/>
                <strong className="text-blue-600">{email}</strong>
              </p>
              <p className="text-gray-500 text-xs mt-4 italic">
                Please click the link in your email to activate your account.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => setStep('login')}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-50"
              >
                Go to Login
              </button>
              <button
                onClick={handleBack}
                className="w-full py-3 text-gray-500 hover:text-gray-700 text-sm font-semibold transition-all"
              >
                Back to Signup
              </button>
            </div>
          </div>
        )}

        {/* Password Reset Section */}
        {step === 'reset-request' && (
          <form onSubmit={handleRequestPasswordReset} className="space-y-5">
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-2">
              <p className="text-xs text-orange-800 font-medium leading-relaxed">
                <i className="fas fa-info-circle mr-1.5"></i>
                Enter your email address and we'll send you a code to reset your password.
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="email@example.com"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-orange-600 text-white rounded-xl font-bold shadow-lg hover:bg-orange-700 transition-all active:scale-[0.98]"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
            
            <button
              type="button"
              onClick={handleBack}
              className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-semibold transition-all"
            >
              ← Back to Options
            </button>
          </form>
        )}

        {/* Reset Verification Step */}
        {step === 'reset-verify' && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1 text-center">
                Reset Code
              </label>
              <input
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-center text-2xl font-bold tracking-[0.5em]"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all pr-12"
                  placeholder="Min 6 characters"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || resetCode.length !== 6 || newPassword.length < 6}
              className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all active:scale-[0.98]"
            >
              {loading ? 'Resetting...' : 'Update Password'}
            </button>
            
            <button
              type="button"
              onClick={() => setStep('reset-request')}
              className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-semibold transition-all"
            >
              ← Resend Code
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link to="/" className="text-xs font-bold text-gray-400 hover:text-blue-600 uppercase tracking-widest transition-colors">
            <i className="fas fa-chevron-left mr-1.5"></i>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailLogin;