import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const Login: React.FC = () => {
  const [step, setStep] = useState<'identifier' | 'password' | 'forgot' | 'reset-otp'>('identifier');
  const [identifier, setIdentifier] = useState(''); // Can be email or phone
  const [isEmail, setIsEmail] = useState(false);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const validateIdentifier = (val: string) => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    const phoneRegex = /^[0-9]{10}$/;
    
    if (emailRegex.test(val)) {
      setIsEmail(true);
      return true;
    } else if (phoneRegex.test(val)) {
      setIsEmail(false);
      return true;
    }
    return false;
  };

  const handleIdentifierChange = (val: string) => {
    setIdentifier(val);
    const emailRegex = /^\S+@\S+\.\S+$/;
    setIsEmail(emailRegex.test(val));
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateIdentifier(identifier)) {
      setStep('password');
    } else {
      setError('Please enter a valid email address or 10-digit mobile number');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!validateIdentifier(identifier)) {
      setError('Please enter a valid email or 10-digit mobile number');
      return;
    }
    
    if (!password) {
      setError('Please enter your password');
      return;
    }
    
    setLoading(true);
    
    try {
      const endpoint = isEmail ? `${API_BASE_URL}/auth/email/login` : `${API_BASE_URL}/auth/login/traditional`;
      const payload = isEmail ? { email: identifier, password } : { phone: identifier, password };
      
      const response = await axios.post(endpoint, payload);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', response.data.data.user.name);
        localStorage.setItem('userData', JSON.stringify(response.data.data.user));
        
        setMessage('Login successful! Redirecting...');
        
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('identifier');
    setOtp('');
    setPassword('');
    setNewPassword('');
    setError('');
    setMessage('');
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!identifier) {
      setError('Please enter your email or phone number');
      return;
    }
    
    setLoading(true);
    
    try {
      const endpoint = isEmail 
        ? `${API_BASE_URL}/auth/email/password-reset/request` 
        : `${API_BASE_URL}/auth/password-reset/request-otp`;
      
      const payload = isEmail ? { email: identifier } : { phone: identifier };
      
      const response = await axios.post(endpoint, payload);
      
      if (response.data.success) {
        setStep('reset-otp');
        setMessage(response.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!otp) {
      setError(`Please enter the ${isEmail ? 'code' : 'OTP'}`);
      return;
    }
    
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      const endpoint = isEmail 
        ? `${API_BASE_URL}/auth/email/password-reset/verify` 
        : `${API_BASE_URL}/auth/password-reset/verify-otp`;
      
      const payload = isEmail 
        ? { email: identifier, resetCode: otp, newPassword } 
        : { phone: identifier, otp, newPassword };
      
      const response = await axios.post(endpoint, payload);
      
      if (response.data.success) {
        setMessage(response.data.message);
        
        setTimeout(() => {
          setStep('identifier');
          setOtp('');
          setNewPassword('');
          setMessage('');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 transition-all duration-300">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4 shadow-lg shadow-green-200">
            <i className="fas fa-store text-white text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 'identifier' ? 'Welcome Back' : 
             step === 'password' ? 'Enter Password' : 
             'Reset Password'}
          </h1>
          <p className="text-gray-500 mt-1">
            {step === 'identifier' ? 'Login to your account' : 
             step === 'password' ? `Continue as ${identifier}` : 
             'Follow steps to reset password'}
          </p>
        </div>

        {/* Error/Success Messages */}
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

        {/* Identifier Step */}
        {step === 'identifier' && (
          <form onSubmit={handleContinue} className="space-y-6">
            <div>
              <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700 mb-2">
                Email or Mobile Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <i className={`fas ${isEmail ? 'fa-envelope' : 'fa-phone-alt'} transition-all`}></i>
                </span>
                <input
                  type="text"
                  id="identifier"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-gray-800"
                  placeholder="email@example.com or 9876543210"
                  value={identifier}
                  onChange={(e) => handleIdentifierChange(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 hover:shadow-green-200 active:scale-[0.98] transition-all"
            >
              Continue
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs font-medium uppercase tracking-wider">New to GK Shop?</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>
            
            <Link
              to="/signup"
              className="block w-full py-3 text-center border-2 border-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all"
            >
              Create an Account
            </Link>
          </form>
        )}

        {/* Password Step */}
        {step === 'password' && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <i className={`fas ${isEmail ? 'fa-envelope' : 'fa-phone-alt'} text-xs`}></i>
                </div>
                <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{identifier}</span>
              </div>
              <button type="button" onClick={handleBack} className="text-xs font-bold text-green-600 hover:text-green-700 uppercase tracking-tight">
                Change
              </button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setStep('forgot')}
                  className="text-xs font-bold text-green-600 hover:text-green-700 uppercase tracking-tight"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type="password"
                  id="password"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-gray-800"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 hover:shadow-green-200 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </div>
              ) : (
                'Login'
              )}
            </button>

            <button
              type="button"
              onClick={handleBack}
              className="w-full py-2 text-gray-500 hover:text-gray-700 font-semibold text-sm transition-all"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Start
            </button>
          </form>
        )}

        {/* Reset Password Step */}
        {step === 'reset-otp' && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
              <p className="text-xs text-orange-800 font-medium leading-relaxed">
                <i className="fas fa-info-circle mr-1.5"></i>
                Please enter the {isEmail ? 'verification code' : 'OTP'} sent to your {isEmail ? 'email' : 'phone'}.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="otp"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-center text-xl font-bold tracking-[0.5em]"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-gray-800"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || otp.length !== 6 || newPassword.length < 6}
              className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 transition-all disabled:opacity-70"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={handleBack}
              className="w-full py-2 text-gray-500 hover:text-gray-700 font-semibold text-sm"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Cancel
            </button>
          </form>
        )}

        {/* Forgot Password Step (Request) */}
        {step === 'forgot' && (
          <form onSubmit={handleForgotPasswordRequest} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-800 font-medium leading-relaxed">
                <i className="fas fa-paper-plane mr-1.5"></i>
                We will send a reset link/OTP to your registered {isEmail ? 'email' : 'phone number'}.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all disabled:opacity-70"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              onClick={() => setStep('password')}
              className="w-full py-2 text-gray-500 hover:text-gray-700 font-semibold text-sm"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Login
            </button>
          </form>
        )}
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <Link to="/" className="text-xs font-bold text-gray-400 hover:text-green-600 uppercase tracking-widest transition-colors">
            <i className="fas fa-chevron-left mr-1.5"></i>
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;