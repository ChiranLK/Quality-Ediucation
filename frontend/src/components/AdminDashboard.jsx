import React, { useState, useEffect } from 'react';
import { Users, BookOpen, TrendingUp, Activity, Mail, Calendar, Award } from 'lucide-react';
import { authAPI, feedbackAPI } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTutors: 0,
    totalStudents: 0,
    totalAdmins: 0,
    totalFeedbacks: 0,
    recentUsers: [],
    topRatedTutors: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all users
      const usersResponse = await authAPI.getAllUsers();
      const users = usersResponse.data.users || [];

      // Calculate stats
      const tutors = users.filter(u => u.role === 'tutor');
      const students = users.filter(u => u.role === 'user');
      const admins = users.filter(u => u.role === 'admin');

      // Try to fetch all feedbacks, but don't fail if endpoint doesn't exist
      let totalFeedbacks = 0;
      try {
        const feedbacksResponse = await feedbackAPI.getAllFeedbacks();
        totalFeedbacks = feedbacksResponse.data?.length || 0;
      } catch (feedbackError) {
        console.warn('Feedbacks endpoint not available, skipping feedback count');
        // Calculate approximate feedbacks from tutors' feedback counts
        totalFeedbacks = tutors.reduce((sum, t) => sum + (t.tutorProfile?.rating?.count || 0), 0);
      }

      // Get recent users (last 5)
      const recentUsers = users
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Get top rated tutors
      const topRatedTutors = tutors
        .filter(t => t.tutorProfile?.rating?.average > 0)
        .sort((a, b) => (b.tutorProfile?.rating?.average || 0) - (a.tutorProfile?.rating?.average || 0))
        .slice(0, 5);

      setStats({
        totalUsers: users.length,
        totalTutors: tutors.length,
        totalStudents: students.length,
        totalAdmins: admins.length,
        totalFeedbacks,
        recentUsers,
        topRatedTutors,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Administrator Dashboard</h2>
        <p className="text-gray-600 mt-2">Platform overview and key metrics</p>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="card hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        {/* Total Tutors */}
        <div className="card hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-100 rounded-full">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tutors</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalTutors}</p>
            </div>
          </div>
        </div>

        {/* Total Students */}
        <div className="card hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        {/* Total Admins */}
        <div className="card hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-red-100 rounded-full">
              <Award className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Admins</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalAdmins}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Feedbacks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Total Feedbacks
            </h3>
            <span className="text-3xl font-bold text-blue-600">{stats.totalFeedbacks}</span>
          </div>
          <p className="text-sm text-gray-600">Student-tutor feedback submissions</p>
        </div>

        {/* Tutor-Student Ratio */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Tutor-Student Ratio
            </h3>
            <span className="text-3xl font-bold text-green-600">
              1:{stats.totalTutors > 0 ? (stats.totalStudents / stats.totalTutors).toFixed(1) : 0}
            </span>
          </div>
          <p className="text-sm text-gray-600">Average students per tutor</p>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Recent Registrations
        </h3>
        <div className="space-y-3">
          {stats.recentUsers.length > 0 ? (
            stats.recentUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{user.fullName}</p>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'tutor' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 py-8">No recent users</p>
          )}
        </div>
      </div>

      {/* Top Rated Tutors */}
      {stats.topRatedTutors.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            Top Rated Tutors
          </h3>
          <div className="space-y-3">
            {stats.topRatedTutors.map((tutor, index) => (
              <div key={tutor._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    #{index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{tutor.fullName}</p>
                    <p className="text-sm text-gray-600 truncate">
                      {tutor.tutorProfile?.subjects?.join(', ') || 'No subjects'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <div className="text-right">
                    <p className="font-bold text-yellow-600 text-lg">
                      {tutor.tutorProfile?.rating?.average?.toFixed(1) || 0}
                    </p>
                    <p className="text-xs text-gray-600">
                      ({tutor.tutorProfile?.rating?.count || 0} ratings)
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < Math.floor(tutor.tutorProfile?.rating?.average || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
