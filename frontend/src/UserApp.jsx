import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, BarChart3, TrendingUp, LogOut, User, Mail, Phone, MapPin } from 'lucide-react';
import Login from './components/Login';
import Register from './components/Register';
import FeedbackAndRating from './components/FeedbackAndRating';
import ProgressTracker from './components/ProgressTracker';
import UserProfile from './components/UserProfile';
import './index.css';

export default function UserApp() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('feedback');
  const [authForm, setAuthForm] = useState('login');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showDetailedProfile, setShowDetailedProfile] = useState(false);
  const profileDropdownRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowUserProfile(false);
      }
    };

    if (showUserProfile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showUserProfile]);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('userAuthToken');
    const userData = localStorage.getItem('userProfileData');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        
        // Only allow user role on this portal
        if (user.role === 'user') {
          setUser(user);
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('userAuthToken');
          localStorage.removeItem('userProfileData');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('userAuthToken');
        localStorage.removeItem('userProfileData');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    // Check if user is trying to access student portal with tutor/admin role
    if (userData.role === 'tutor' || userData.role === 'admin') {
      alert(`This is the Student Portal. Please use your relevant portal!.\n\nRedirecting you to ${userData.role === 'tutor' ? 'Tutor' : 'Admin'} Portal...`);
      // Clear any previous login data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      // Redirect to protected portal
      window.location.href = '/protected';
      return;
    }

    // Only allow regular users to login here
    if (userData.role !== 'user') {
      setError('Access denied. Invalid user role for this portal.');
      return;
    }

    // Token and userData are already stored in Login component - just update state
    setUser(userData);
    setIsLoggedIn(true);
    setAuthForm('login');
    setActiveTab('feedback');
  };

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (!confirmed) return;
    
    localStorage.removeItem('userAuthToken');
    localStorage.removeItem('userProfileData');
    setIsLoggedIn(false);
    setUser(null);
    setAuthForm('login');
    setActiveTab('feedback');
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const tabs = [
    {
      id: 'feedback',
      label: 'Submit Feedback & Rate',
      icon: MessageSquare,
      component: FeedbackAndRating,
    },
    {
      id: 'progress',
      label: 'Track Progress',
      icon: TrendingUp,
      component: ProgressTracker,
    },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login/register page if not authenticated
  if (!isLoggedIn) {
    return authForm === 'login' ? (
      <Login 
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setAuthForm('register')}
      />
    ) : (
      <Register
        onSwitchToLogin={() => setAuthForm('login')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 cursor-pointer hover:opacity-75 transition-opacity"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-800">
                  Quality Education
                </h1>
                <p className="text-sm text-gray-600">
                  Feedback, Ratings & Progress Tracking
                </p>
              </div>
            </button>
            {/* User Profile and Logout */}
            <div ref={profileDropdownRef} className="flex items-center gap-4 relative">
              <button
                onClick={() => setShowUserProfile(!showUserProfile)}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800 capitalize">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
                </div>
              </button>

              {/* User Profile Dropdown */}
              {showUserProfile && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-0 z-50">
                  {/* Profile Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-lg text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-bold capitalize">{user?.name || user?.email}</p>
                        <p className="text-sm text-blue-100 capitalize">{user?.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="p-6 space-y-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <p className="text-sm font-medium text-gray-800 break-all">{user?.email}</p>
                      </div>
                    </div>
                    {user?.phoneNumber && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-600">Phone</p>
                          <p className="text-sm font-medium text-gray-800">{user?.phoneNumber}</p>
                        </div>
                      </div>
                    )}
                    {user?.location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-600">Location</p>
                          <p className="text-sm font-medium text-gray-800">{user?.location}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 space-y-2">
                    <button
                      onClick={() => {
                        setShowUserProfile(false);
                        setShowDetailedProfile(true);
                        setActiveTab('profile');
                      }}
                      className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowUserProfile(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 md:gap-1 border-b border-gray-200">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-medium text-sm flex items-center gap-2 transition-all border-b-2 ${
                    isActive
                      ? 'text-blue-600 border-blue-600 bg-blue-50'
                      : 'text-gray-600 border-transparent hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {showDetailedProfile ? (
          <div>
            <button
              onClick={() => setShowDetailedProfile(false)}
              className="mb-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              ← Back
            </button>
            <UserProfile user={user} onProfileUpdate={handleProfileUpdate} />
          </div>
        ) : (
          ActiveComponent && <ActiveComponent />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Quality Education
              </h3>
              <p className="text-gray-400 text-sm">
                A peer-learning and tutoring platform connecting students with expert tutors.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Submit Feedback</a></li>
                <li><a href="#" className="hover:text-white">Rate Tutors</a></li>
                <li><a href="#" className="hover:text-white">View Ratings</a></li>
                <li><a href="#" className="hover:text-white">Track Progress</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
              <p>
                &copy; 2026 Quality Education. All rights reserved.
              </p>
              <p>
                Built for better learning
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
