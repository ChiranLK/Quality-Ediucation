import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, X, AlertCircle, CheckCircle, Book } from 'lucide-react';
import axios from 'axios';

export default function UserProfile({ user, onProfileUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [subjectsInput, setSubjectsInput] = useState('');
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    location: user?.location || '',
    subjects: user?.tutorProfile?.subjects || [],
  });

  // Determine token key and storage key based on user role
  const tokenKey = user?.role === 'user' ? 'userAuthToken' : 'tutorAuthToken';
  const storageKey = user?.role === 'user' ? 'userProfileData' : 'tutorProfileData';

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

    if (formData.phoneNumber && !/^[0-9]{10}$/.test(formData.phoneNumber)) {
      setError('Phone number must be exactly 10 digits');
      return false;
    }

    if (!formData.location.trim()) {
      setError('Location is required');
      return false;
    }

    if (user?.role === 'tutor' && formData.subjects.length === 0) {
      setError('Please add at least one subject');
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
      const token = localStorage.getItem(tokenKey);
      
      console.log('Retrieved token from localStorage:', token);
      console.log('Token type:', typeof token);
      console.log('Token length:', token?.length);
      
      if (!token || token === 'undefined' || token === 'null') {
        setError('Authentication token not found. Please login again.');
        throw new Error('No valid token found. Please login again.');
      }
      
      if (typeof token !== 'string' || token.length < 10) {
        setError('Invalid authentication token. Please login again.');
        throw new Error('Invalid token format');
      }

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        location: formData.location,
      };

      if (user?.role === 'tutor') {
        payload.subjects = formData.subjects;
      }

      const apiUrl = 'http://localhost:5000/api/auth/profile';
      console.log('API URL:', apiUrl);
      console.log('Payload:', payload);
      console.log('Token exists:', !!token);

      const response = await axios.put(
        apiUrl,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log('Response:', response.data);

      // Update localStorage with new user data
      const updatedUser = {
        ...user,
        name: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        location: formData.location,
      };

      if (user?.role === 'tutor') {
        updatedUser.tutorProfile = {
          ...user?.tutorProfile,
          subjects: formData.subjects,
        };
      }

      localStorage.setItem(storageKey, JSON.stringify(updatedUser));
      
      setSuccess(true);
      onProfileUpdate(updatedUser);
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error response:', err.response);
      const errorMsg = err.response?.data?.msg || err.response?.data?.message || err.message || 'Failed to update profile';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      location: user?.location || '',
      subjects: user?.tutorProfile?.subjects || [],
    });
    setSubjectsInput('');
    setError(null);
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600" />
            My Profile
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 text-sm">Profile updated successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {isEditing ? (
          /* Edit Mode */
          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="input w-full"
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
                className="input w-full"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Note: Changing your email may require verification</p>
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
                className="input w-full"
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
                className="input w-full"
                required
              />
            </div>

            {/* Subjects (for tutors) */}
            {user?.role === 'tutor' && (
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
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* View Mode */
          <div className="space-y-6">
            {/* Full Name */}
            <div className="pb-6 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Full Name</p>
              <p className="text-lg font-semibold text-gray-800 capitalize">
                {user?.name || 'Not provided'}
              </p>
            </div>

            {/* Email */}
            <div className="pb-6 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Email Address</p>
              <p className="text-lg font-semibold text-gray-800">{user?.email || 'Not provided'}</p>
            </div>

            {/* Phone Number */}
            <div className="pb-6 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Phone Number</p>
              <p className="text-lg font-semibold text-gray-800">
                {user?.phoneNumber || 'Not provided'}
              </p>
            </div>

            {/* Location */}
            <div className="pb-6 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Location</p>
              <p className="text-lg font-semibold text-gray-800">{user?.location || 'Not provided'}</p>
            </div>

            {/* Subjects (for tutors) */}
            {user?.role === 'tutor' && (
              <div>
                <p className="text-sm text-gray-600 mb-3">Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {user?.tutorProfile?.subjects && user?.tutorProfile?.subjects?.length > 0 ? (
                    user?.tutorProfile?.subjects?.map((subject, idx) => (
                      <span key={idx} className="text-sm font-semibold text-white bg-blue-600 px-3 py-1 rounded-full">
                        {subject}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">Not provided</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
