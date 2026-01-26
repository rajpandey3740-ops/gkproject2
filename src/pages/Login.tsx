import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const Login: React.FC = () => {
  const [step, setStep] = useState<'phone' | 'password' | 'forgot' | 'reset-otp' | 'email-login'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
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

  // Handle OTP input changes
  const handleOtpChange = (value: string) => {
    setOtp(value);
  };

  const handleBack = () => {
    setStep('phone');
    setOtp('');
    setPassword('');
    setNewPassword('');
    setError('');
    setMessage('');
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    if (!password) {
      setError('Please enter your password');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login/traditional`, {
        phone,
        password,
      });
      
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

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/password-reset/request-otp`, {
        phone,
      });
      
      if (response.data.success) {
        setStep('reset-otp');
        setMessage(response.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/password-reset/verify-otp`, {
        phone,
        otp,
        newPassword,
      });
      
      if (response.data.success) {
        setMessage(response.data.message);
        
        // Reset to phone step after successful password reset
        setTimeout(() => {
          setStep('phone');
          setPhone('');
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

  const handleBackToPhone = () => {
    setStep('phone');
    setPhone('');
    setOtp('');
    setPassword('');
    setNewPassword('');
    setError('');
    setMessage('');
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
      const response = await axios.post(`${API_BASE_URL}/auth/email/login`, {
        email,
        password,
      });
      
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

  const handleEmailSignupRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/email/signup/request-verification`, {
        email,
        name: email.split('@')[0], // Use email prefix as name
      });
      
      if (response.data.success) {
        setMessage(response.data.message);
        // Optionally redirect to verification page
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-95 backdrop-blur rounded-3xl shadow-2xl max-w-md w-full p-8 fade-in-up">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
            <i className="fas fa-store text-white text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {step === 'phone' ? 'Welcome Back!' : 
             step === 'password' ? 'Login with Password' : 
             step === 'forgot' ? 'Forgot Password' : 
             step === 'reset-otp' ? 'Reset Password' : 'Login with Email'}
          </h1>
          <p className="text-gray-600">
            {step === 'phone' ? 'Login with your mobile number' : 
             step === 'password' ? 'Enter your password to login' : 
             step === 'forgot' ? 'Enter your mobile number to receive OTP for password reset' : 
             step === 'reset-otp' ? 'Enter the OTP sent to your phone and new password' : 
             'Enter your email and password to login'}
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            <i className="fas fa-check-circle mr-2"></i>
            {message}
          </div>
        )}

        {/* Phone Step */}
        {step === 'phone' && (
          <div className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-phone mr-2 text-purple-600"></i>Mobile Number
              </label>
              <input
                type="tel"
                id="phone"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 transition-all text-lg"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                We'll send an OTP to verify your number
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep('password')}
              disabled={phone.length !== 10}
              className="w-full py-4 gradient-bg text-white font-bold text-lg rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue with Password
            </button>
            
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            
            <button
              type="button"
              onClick={() => setStep('email-login')}
              className="w-full py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all"
            >
              Login with Email
            </button>
          </div>
        )}

        {/* Password Login Step */}
        {step === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-phone mr-2 text-purple-600"></i>Mobile Number
              </label>
              <input
                type="tel"
                id="phone"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 transition-all text-lg"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                autoFocus
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-lock mr-2 text-purple-600"></i>Password
              </label>
              <input
                type="password"
                id="password"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 transition-all text-lg"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || phone.length !== 10 || !password}
              className="w-full py-4 gradient-bg text-white font-bold text-lg rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(loading) ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>

            <button
              type="button"
              onClick={handleBack}
              className="w-full py-3 text-gray-600 hover:text-gray-800 font-semibold transition-all"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Options
            </button>
          </form>
        )}

        {/* Forgot Password Step */}
        {step === 'forgot' && (
          <form onSubmit={handleForgotPasswordRequest} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-phone mr-2 text-purple-600"></i>Mobile Number
              </label>
              <input
                type="tel"
                id="phone"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 transition-all text-lg"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full py-4 gradient-bg text-white font-bold text-lg rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(loading) ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Sending OTP...
                </span>
              ) : (
                'Send Reset OTP'
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToPhone}
              className="w-full py-3 text-gray-600 hover:text-gray-800 font-semibold transition-all"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Options
            </button>
          </form>
        )}
        
        {/* Reset Password with OTP Step */}
        {step === 'reset-otp' && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-phone mr-2 text-purple-600"></i>Mobile Number
              </label>
              <input
                type="tel"
                id="phone"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 transition-all text-lg"
                placeholder="Enter 10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                autoFocus
              />
            </div>
            
            <div>
              <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-key mr-2 text-purple-600"></i>Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 transition-all text-center text-2xl tracking-widest"
                placeholder="000000"
                value={otp}
                onChange={(e) => handleOtpChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-lock mr-2 text-purple-600"></i>New Password
              </label>
              <input
                type="password"
                id="newPassword"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 transition-all text-lg"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || phone.length !== 10 || otp.length !== 6 || !newPassword}
              className="w-full py-4 gradient-bg text-white font-bold text-lg rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(loading) ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Resetting Password...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToPhone}
              className="w-full py-3 text-gray-600 hover:text-gray-800 font-semibold transition-all"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Options
            </button>
          </form>
        )}

        {/* Email Login Step */}
        {step === 'email-login' && (
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-envelope mr-2 text-purple-600"></i>Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 transition-all text-lg"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-lock mr-2 text-purple-600"></i>Password
              </label>
              <input
                type="password"
                id="password"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 transition-all text-lg"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-4 gradient-bg text-white font-bold text-lg rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(loading) ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToPhone}
              className="w-full py-3 text-gray-600 hover:text-gray-800 font-semibold transition-all"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Phone Login
            </button>
            
            {/* Email Signup Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-center text-gray-600 mb-4">Don't have an account?</h3>
              <form onSubmit={handleEmailSignupRequest} className="space-y-4">
                <div>
                  <label htmlFor="email-signup" className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-envelope mr-2 text-purple-600"></i>Email Address
                  </label>
                  <input
                    type="email"
                    id="email-signup"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 transition-all text-lg"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="password-signup" className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-lock mr-2 text-purple-600"></i>Password
                  </label>
                  <input
                    type="password"
                    id="password-signup"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 transition-all text-lg"
                    placeholder="Create a password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                >
                  Sign Up with Email
                </button>
              </form>
            </div>
          </form>
        )}
        
        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-purple-600 hover:text-purple-700 font-semibold">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            <i className="fas fa-arrow-left mr-2"></i>Back to Home
          </Link>
        </div>
      </div>

      <style>{`
        .fade-in-up {
          animation: fadeInUp 0.6s ease;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;