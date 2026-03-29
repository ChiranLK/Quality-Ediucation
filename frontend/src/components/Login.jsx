import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

export default function Login({ onLoginSuccess, onSwitchToRegister, portalType = 'main', registerLink = null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
  });

  // Fetch user role by email
  const handleEmailChange = async (e) => {
    const email = e.target.value;
    setFormData(prev => ({
      ...prev,
      email,
    }));

    if (!email) {
      setFormData(prev => ({
        ...prev,
        role: '',
      }));
      return;
    }

    // Debounce role lookup
    setEmailLoading(true);
    setError(null);

    try {
      // Make a request to check email and get role
      const response = await axios.post('http://localhost:5000/api/auth/check-email', {
        email,
      });

      if (response.data.role) {
        setFormData(prev => ({
          ...prev,
          role: response.data.role,
        }));
      }
    } catch (err) {
      // Email doesn't exist in database yet - user can proceed with registration
      setFormData(prev => ({
        ...prev,
        role: '',
      }));
      // Don't show error for non-existent email
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setFormData(prev => ({
      ...prev,
      password: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        setError('Please enter email and password');
        setLoading(false);
        return;
      }

      if (!formData.role) {
        setError('Email not recognized. Please check or register first.');
        setLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      // Store token in localStorage with portal-specific keys
      const { token, user } = response.data;
      console.log('Full login response:', response.data);
      console.log('Token received:', token);
      console.log('Token type:', typeof token);
      console.log('Token value:', token || 'TOKEN IS UNDEFINED/NULL');
      console.log('Token length:', token?.length);
      
      if (!token) {
        throw new Error('No token received from server. Token: ' + JSON.stringify(token));
      }
      
      // Verify token before storing
      if (typeof token !== 'string' || token.length < 10) {
        console.error('Invalid token format received:', token);
        throw new Error('Invalid token format received from server');
      }
      
      // Use different storage types for different roles/portals
      let tokenKey, userDataKey;
      let storage = localStorage; // default
      
      if (portalType === 'protected') {
        // For protected portal: use role-specific keys
        if (formData.role === 'admin') {
          tokenKey = 'adminAuthToken';
          userDataKey = 'adminProfileData';
          storage = localStorage; // Admin uses localStorage for persistence
          // Clear all other tokens to avoid conflicts
          sessionStorage.removeItem('tutorAuthToken');
          sessionStorage.removeItem('tutorProfileData');
          localStorage.removeItem('tutorAuthToken');
          localStorage.removeItem('tutorProfileData');
          localStorage.removeItem('userAuthToken');
          localStorage.removeItem('userProfileData');
        } else {
          tokenKey = 'tutorAuthToken';
          userDataKey = 'tutorProfileData';
          storage = sessionStorage; // Tutor uses sessionStorage (isolated per tab)
          // Clear admin and student tokens to avoid conflicts
          localStorage.removeItem('adminAuthToken');
          localStorage.removeItem('adminProfileData');
          localStorage.removeItem('userAuthToken');
          localStorage.removeItem('userProfileData');
        }
      } else {
        // For student portal
        tokenKey = 'userAuthToken';
        userDataKey = 'userProfileData';
        // Clear tutor and admin tokens to avoid conflicts
        sessionStorage.removeItem('tutorAuthToken');
        sessionStorage.removeItem('tutorProfileData');
        localStorage.removeItem('adminAuthToken');
        localStorage.removeItem('adminProfileData');
      }
      
      storage.setItem(tokenKey, token);
      storage.setItem(userDataKey, JSON.stringify(user));
      
      console.log('Token stored in localStorage:', localStorage.getItem(tokenKey));

      // Call the success callback
      onLoginSuccess(user);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMsg);
      console.error('Login error:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      user: 'Student',
      tutor: 'Tutor',
      admin: 'Administrator',
    };
    return roleMap[role] || role;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Quality Education</h1>
          <p className="text-gray-600 mt-2">
            {portalType === 'protected' 
              ? 'Protected Portal' 
              : 'Feedback, Ratings & Progress Tracking'}
          </p>
        </div>

        {/* Login Card */}
        <div className="card shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Login</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={handleEmailChange}
                placeholder="Enter your registered email"
                className="input"
                required
              />

              {formData.email && !formData.role && !emailLoading && (
                <p className="mt-2 text-sm text-red-600">
                  Email not found. Please register first.
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your password"
                  className="input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.role}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Login
                </>
              )}
            </button>
          </form>

          {/* Register Link or Access Info */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            {portalType === 'protected' ? (
              registerLink ? (
                <p className="text-sm text-gray-600">
                  Don't have an account?
                  <a
                    href={registerLink}
                    className="text-blue-600 hover:text-blue-800 font-semibold ml-1"
                  >
                    Register here
                  </a>
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  This portal is for <span className="font-semibold">Tutors and Administrators</span> only.
                </p>
              )
            ) : (
              <p className="text-sm text-gray-600">
                Don't have an account?
                <button
                  onClick={onSwitchToRegister}
                  className="text-blue-600 hover:text-blue-800 font-semibold ml-1"
                >
                  Register here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
