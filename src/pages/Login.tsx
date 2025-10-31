import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // For demo purposes - in production, this would call an API
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', username);
    
    if (remember) {
      localStorage.setItem('rememberMe', 'true');
    }

    // Show success notification
    alert('Login successful! Redirecting...');

    // Redirect to home page
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-95 backdrop-blur rounded-3xl shadow-2xl max-w-md w-full p-8 fade-in-up">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
            <i className="fas fa-store text-white text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Login to GK General Store</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email/Phone */}
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-user mr-2 text-purple-600"></i>Email or Phone
            </label>
            <input
              type="text"
              id="username"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 transition-all"
              placeholder="Enter your email or phone"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-lock mr-2 text-purple-600"></i>Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-600 transition-all pr-12"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 text-purple-600 rounded"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-700">Remember me</span>
            </label>
            <button
              type="button"
              className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
              onClick={() => alert('Password reset link will be sent to your email')}
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-4 gradient-bg text-white font-bold text-lg rounded-xl shadow-lg hover:opacity-90 transition-all"
          >
            Login
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => alert('Google login will be implemented soon')}
              className="flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-purple-500 transition-all"
            >
              <i className="fab fa-google text-red-500 mr-2"></i>
              <span className="font-semibold text-gray-700">Google</span>
            </button>
            <button
              type="button"
              onClick={() => alert('Facebook login will be implemented soon')}
              className="flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-purple-500 transition-all"
            >
              <i className="fab fa-facebook text-blue-600 mr-2"></i>
              <span className="font-semibold text-gray-700">Facebook</span>
            </button>
          </div>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => alert('Sign up page coming soon!')}
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              Sign Up
            </button>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-arrow-left mr-2"></i>Back to Home
          </button>
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
