import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Star, MessageSquare, Users, Loader, AlertCircle, ArrowRight, Clock } from 'lucide-react';
import customFetch from '../../utils/customfetch';

export default function TutorHome({ user, onNavigate }) {
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    studentsCount: 0,
    averageRating: 0,
    feedbacksCount: 0,
    nextSessions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch sessions for this tutor
        const { data: sessionsData } = await customFetch.get(`/tutoring-sessions/tutor/${user?._id}`);
        const allSessions = sessionsData.sessions || [];
        
        // Get current time
        const now = new Date();
        
        // Filter upcoming sessions and sort by date
        const upcomingSessionsList = allSessions
          .filter(s => {
            const sessionDate = new Date(s.schedule?.date || s.scheduledDate);
            return sessionDate > now;
          })
          .sort((a, b) => {
            const dateA = new Date(a.schedule?.date || a.scheduledDate);
            const dateB = new Date(b.schedule?.date || b.scheduledDate);
            return dateA - dateB;
          });

        const upcomingCount = upcomingSessionsList.length;
        const nextSessions = upcomingSessionsList.slice(0, 2); // Get next 2 sessions for preview
        
        // Get unique students
        const uniqueStudents = new Set(allSessions.map(s => s.studentId?._id)).size;

        // Fetch ratings
        const { data: ratingData } = await customFetch.get(`/feedbacks/tutor/${user?._id}/ratings`);
        const avgRating = ratingData.averageRating || 0;

        // Fetch feedbacks
        const { data: feedbackData } = await customFetch.get(`/feedbacks/tutor/${user?._id}`);
        const feedbacksCount = feedbackData.feedbacks ? feedbackData.feedbacks.length : 0;

        setStats({
          upcomingSessions: upcomingCount,
          studentsCount: uniqueStudents,
          averageRating: parseFloat(avgRating),
          feedbacksCount,
          nextSessions,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchDashboardData();
    }
  }, [user]);

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

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Upcoming Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Upcoming Sessions</h3>
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.upcomingSessions}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Scheduled sessions</p>
          </div>
          
          {/* Preview Section */}
          {stats.upcomingSessions > 0 ? (
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700/30">
              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">Next Sessions</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {stats.nextSessions.map((session, idx) => {
                  const sessionDate = new Date(session.schedule?.date || session.scheduledDate);
                  const dateStr = sessionDate.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  });
                  return (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded bg-white dark:bg-gray-800">
                      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                          {session.subject || 'Tutoring Session'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{dateStr}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700/30">
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">No upcoming sessions</p>
            </div>
          )}
        </div>

        {/* Students */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold">My Students</h3>
            <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.studentsCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Active students</p>
        </div>

        {/* Average Rating */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Average Rating</h3>
            <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.averageRating.toFixed(1)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Out of 5 stars</p>
        </div>

        {/* Feedbacks Received */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Feedbacks Received</h3>
            <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.feedbacksCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">From students</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate?.('My Sessions')} 
          className=",bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">My Sessions</h3>
            <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">View and manage your sessions</p>
        </div>

        <div 
          onClick={() => onNavigate?.('Student Progress')} 
          className=",bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-lg p-6 border border-teal-200 dark:border-teal-700 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Student Progress</h3>
            <ArrowRight className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">Track and update progress</p>
        </div>

        <div 
          onClick={() => onNavigate?.('Your Ratings')} 
          className=",bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-6 border border-amber-200 dark:border-amber-700 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Your Ratings</h3>
            <ArrowRight className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">View rating statistics</p>
        </div>

        <div 
          onClick={() => onNavigate?.('Feedbacks')} 
          className=",bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Feedbacks</h3>
            <ArrowRight className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">Read feedback from students</p>
        </div>
      </div>
    </div>
  );
}
