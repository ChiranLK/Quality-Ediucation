import React, { useState } from 'react';
import { Mail, Lock, User, Phone, MapPin, Book, AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

export default function ProtectedRegister({ onSwitchToLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'tutor',
    phoneNumber: '',
    location: '',
    subjects: [],
  });

  const [subjectsInput, setSubjectsInput] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const addSubject = () => {
    const subject = subjectsInput.trim();
    if (subject && !formData.subjects.includes(subject)) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, subject],
      }));
      setSubjectsInput('');
    }
  };

  const removeSubject = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject),
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.password) {
      setError('Password is required');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.role === 'tutor' && formData.subjects.length === 0) {
      setError('Please add at least one subject for tutors');
      return false;
    }

    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError('Phone number must be exactly 10 digits');
      return false;
    }

    if (!formData.location.trim()) {
      setError('Location is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phoneNumber: formData.phoneNumber,
        location: formData.location,
      };

      if (formData.role === 'tutor') {
        payload.subjects = formData.subjects;
      }

      await axios.post('http://localhost:5000/api/auth/register', payload);

      setSuccess(true);
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'tutor',
        phoneNumber: '',
        location: '',
        subjects: [],
      });

      // Redirect to protected login after 2 seconds
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMsg);
      console.error('Registration error:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card shadow-lg text-center">
            <div className="mb-4 flex justify-center">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-4">Your account has been created successfully.</p>
            <p className="text-sm text-gray-600">Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onSwitchToLogin}
            className="p-2 hover:bg-gray-200 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Quality Education</h1>
            <p className="text-gray-600 text-sm">Protected Registration</p>
          </div>
        </div>

        {/* Registration Card */}
        <div className="card shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Register as Tutor</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="input"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="input"
                required
              />
            </div>

            {/* Subjects (for tutor) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subjects *
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={subjectsInput}
                  onChange={(e) => setSubjectsInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSubject();
                    }
                  }}
                  placeholder="Type subject (e.g., Mathematics)"
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={addSubject}
                  className="btn-secondary px-4 py-2"
                >
                  Add
                </button>
              </div>
              {formData.subjects.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.subjects.map(subject => (
                    <div
                      key={subject}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {subject}
                      <button
                        type="button"
                        onClick={() => removeSubject(subject)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password (min. 6 characters)"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className="input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number * (10 digits)
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="e.g., 0712345678"
                maxLength="10"
                pattern="[0-9]{10}"
                className="input"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Must be exactly 10 digits</p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Colombo, Sri Lanka"
                className="input"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?
              <button
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-blue-800 font-semibold ml-1"
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
