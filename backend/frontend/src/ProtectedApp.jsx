import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Star, TrendingUp, MessageSquare, LogOut, Users, BookOpen, BarChart2, User, Mail, Phone, MapPin } from 'lucide-react';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import ViewRatings from './components/ViewRatings';
import ManageUsers from './components/ManageUsers';
import MyStudents from './components/MyStudents';
import AdminDashboard from './components/AdminDashboard';
import './index.css';

export default function ProtectedApp() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
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

  useEffect(() => {
    // Check for admin login first (localStorage), then tutor (sessionStorage)
    let token = localStorage.getItem('adminAuthToken');
    let storedUser = localStorage.getItem('adminProfileData');
    let userDataKey = 'adminProfileData';
    
    if (!token) {
      // Check sessionStorage for tutor (tab-specific)
      token = sessionStorage.getItem('tutorAuthToken');
      storedUser = sessionStorage.getItem('tutorProfileData');
      userDataKey = 'tutorProfileData';
    }
    
    if (token && storedUser) {
      const userData = JSON.parse(storedUser);
      // Check if user is tutor or admin
      if (userData.role === 'tutor' || userData.role === 'admin') {
        setIsLoggedIn(true);
        setUser(userData);
      } else {
        // User trying to access protected route
        alert('Access denied. This portal is for tutors and admins only.\n\nRedirecting you to Student Portal...');
        localStorage.removeItem('tutorAuthToken');
        localStorage.removeItem('tutorProfileData');
        localStorage.removeItem('adminAuthToken');
        localStorage.removeItem('adminProfileData');
        sessionStorage.removeItem('tutorAuthToken');
        sessionStorage.removeItem('tutorProfileData');
        window.location.href = '/student';
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    // Verify user is tutor or admin
    if (userData.role === 'tutor' || userData.role === 'admin') {
      setUser(userData);
      setIsLoggedIn(true);
      // The actual token storage is already done in Login.jsx with appropriate storage type
    } else {
      alert('Access denied. use your relevant portal!.\n\nRedirecting you to Student Portal...');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/student';
    }
  };

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (!confirmed) return;
    
    // Clear tokens from both storage types
    localStorage.removeItem('adminAuthToken');
    localStorage.removeItem('adminProfileData');
    localStorage.removeItem('tutorAuthToken');
    localStorage.removeItem('tutorProfileData');
    sessionStorage.removeItem('tutorAuthToken');
    sessionStorage.removeItem('tutorProfileData');
    setIsLoggedIn(false);
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  // Fetch latest user data from backend
  const fetchUserFromDatabase = async () => {
    try {
      // Check for admin token (localStorage) first, then tutor (sessionStorage)
      let token = localStorage.getItem('adminAuthToken');
      let userDataKey = 'adminProfileData';
      let storage = localStorage;
      
      if (!token) {
        token = sessionStorage.getItem('tutorAuthToken');
        userDataKey = 'tutorProfileData';
        storage = sessionStorage;
      }
      
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched user from database:', data);
        setUser(data);
        // Update storage with latest data
        storage.setItem(userDataKey, JSON.stringify(data));
      }
    } catch (err) {
      console.error('Failed to fetch user from database:', err);
    }
  };

  // Fetch user data when tab changes to dashboard
  useEffect(() => {
    if (isLoggedIn && activeTab === 'dashboard') {
      fetchUserFromDatabase();
    }
  }, [activeTab, isLoggedIn]);

  // Show login if not authenticated
  if (!isLoggedIn) {
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess}
        portalType="protected"
        registerLink="/register/protected"
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
                <h1 className="text-2xl font-bold text-gray-800">Quality Education</h1>
                <p className="text-sm text-gray-600">Tutor & Admin Portal</p>
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
                  <p className="text-xs text-gray-600 capitalize bg-blue-100 px-2 py-1 rounded">
                    {user?.role === 'tutor' ? 'Tutor' : 'Admin'}
                  </p>
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
                        <p className="text-sm text-blue-100 capitalize">{user?.role === 'tutor' ? 'Tutor' : 'Admin'}</p>
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
                    {user?.role === 'tutor' && user?.tutorProfile?.subjects && (
                      <div className="flex items-start gap-3">
                        <BookOpen className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-xs text-gray-600">Subjects</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {user?.tutorProfile?.subjects?.map((subject, idx) => (
                              <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                {subject}
                              </span>
                            ))}
                          </div>
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
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-3 font-medium text-sm flex items-center gap-2 transition-all border-b-2 ${
                activeTab === 'dashboard'
                  ? 'text-blue-600 border-blue-600 bg-blue-50'
                  : 'text-gray-600 border-transparent hover:text-gray-800'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden"></span>
            </button>
            {user?.role === 'tutor' && (
              <>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`px-4 py-3 font-medium text-sm flex items-center gap-2 transition-all border-b-2 ${
                    activeTab === 'students'
                      ? 'text-blue-600 border-blue-600 bg-blue-50'
                      : 'text-gray-600 border-transparent hover:text-gray-800'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">My Students</span>
                  <span className="sm:hidden"></span>
                </button>
                <button
                  onClick={() => setActiveTab('materials')}
                  className={`px-4 py-3 font-medium text-sm flex items-center gap-2 transition-all border-b-2 ${
                    activeTab === 'materials'
                      ? 'text-blue-600 border-blue-600 bg-blue-50'
                      : 'text-gray-600 border-transparent hover:text-gray-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Study Materials</span>
                  <span className="sm:hidden"></span>
                </button>
              </>
            )}
            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-3 font-medium text-sm flex items-center gap-2 transition-all border-b-2 ${
                  activeTab === 'users'
                    ? 'text-blue-600 border-blue-600 bg-blue-50'
                    : 'text-gray-600 border-transparent hover:text-gray-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Manage Users</span>
                <span className="sm:hidden"></span>
              </button>
            )}
            {(user?.role === 'tutor' || user?.role === 'admin') && (
              <button
                onClick={() => setActiveTab('ratings')}
                className={`px-4 py-3 font-medium text-sm flex items-center gap-2 transition-all border-b-2 ${
                  activeTab === 'ratings'
                    ? 'text-blue-600 border-blue-600 bg-blue-50'
                    : 'text-gray-600 border-transparent hover:text-gray-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">View Ratings</span>
                <span className="sm:hidden"></span>
              </button>
            )}
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
          <>
            {activeTab === 'dashboard' && (
          <>
            <div className="mb-6 flex justify-end">
              <button
                onClick={fetchUserFromDatabase}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Refresh Data
              </button>
            </div>

            {user?.role === 'tutor' ? (
              // Tutor Dashboard
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Students</p>
                      <p className="text-2xl font-bold text-gray-800">{user?.tutorProfile?.sessionCount || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Star className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Average Rating</p>
                      <p className="text-2xl font-bold text-gray-800">{(user?.tutorProfile?.rating?.average || 0).toFixed(1)}</p>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Sessions</p>
                      <p className="text-2xl font-bold text-gray-800">{user?.tutorProfile?.rating?.count || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Admin Dashboard
              <AdminDashboard />
            )}
          </>
        )}

            {activeTab === 'students' && user?.role === 'tutor' && (
              <MyStudents />
            )}

            {activeTab === 'materials' && user?.role === 'tutor' && (
          <div className="card">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Study Materials</h3>
            <p className="text-gray-600">Study materials management coming soon...</p>
          </div>
            )}

            {activeTab === 'users' && user?.role === 'admin' && (
              <ManageUsers />
            )}

            {activeTab === 'ratings' && (user?.role === 'tutor' || user?.role === 'admin') && (
              <ViewRatings />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2026 Quality Education Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
