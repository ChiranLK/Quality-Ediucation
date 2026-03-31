import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, MessageSquare, BookOpen, Loader, AlertCircle, ArrowRight } from 'lucide-react';
import customFetch from '../../utils/customfetch';

export default function UserHome({ user, onNavigate }) {
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    totalProgressTopics: 0,
    feedbacksReceived: 0,
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch sessions
        const { data: sessionsData } = await customFetch.get('/tutoring-sessions');
        const allSessions = sessionsData.sessions || [];
        
        // Count upcoming sessions (future date)
        const now = new Date();
        const upcomingSessions = allSessions.filter(s => new Date(s.scheduledDate) > now).length;
        
        // Fetch progress
        const { data: progressData } = await customFetch.get('/progress/me');
        const totalTopics = new Set((progressData.progress || []).map(p => p.topic || p.tutor)).size;
        
        // Fetch feedbacks
        const { data: feedbackData } = await customFetch.get('/feedbacks/me');
        const feedbacksCount = feedbackData.feedbacks ? feedbackData.feedbacks.length : 0;

        setStats({
          upcomingSessions,
          totalProgressTopics: totalTopics,
          feedbacksReceived: feedbacksCount,
        });

        // Set recent sessions (last 3)
        setRecentSessions(allSessions.slice(0, 3).map(s => ({
          _id: s._id,
          tutorName: s.tutorId?.fullName || 'Unknown Tutor',
          date: new Date(s.scheduledDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          status: new Date(s.scheduledDate) > now ? 'Upcoming' : 'Completed',
        })));
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 rounded-lg p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">{greeting} {user?.fullName || 'Student'}!</h1>
        <p className="text-blue-100">Stay on track with your learning journey</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Upcoming Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Upcoming Sessions</h3>
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.upcomingSessions}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Sessions scheduled</p>
        </div>

        {/* Learning Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Topics Learning</h3>
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProgressTopics}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Topics in progress</p>
        </div>

        {/* Feedbacks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Feedbacks Received</h3>
            <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.feedbacksReceived}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">From your tutors</p>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Sessions</h2>
          <BookOpen className="w-5 h-5 text-gray-400 dark:text-gray-600" />
        </div>

        {recentSessions.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">No sessions yet. Schedule a session with a tutor!</p>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div 
                key={session._id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{session.tutorName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{session.date}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  session.status === 'Upcoming'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}>
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div onClick={() => onNavigate?.('Progress')} className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">View Progress</h3>
            <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">Track your learning journey and improvements</p>
        </div>

        <div onClick={() => onNavigate?.('Feedbacks')} className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Rate Tutors</h3>
            <ArrowRight className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">Share feedback to help improve the platform</p>
        </div>
      </div>

      {/* Learning Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          Learning Tip
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Regular feedback sessions with your tutor help track progress faster. Try to schedule at least 2-3 sessions per week for best results!
        </p>
      </div>
    </div>
  );
}
