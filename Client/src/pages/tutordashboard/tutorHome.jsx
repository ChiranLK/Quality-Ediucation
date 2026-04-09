import React, { useState, useEffect } from 'react';
import { 
  Calendar, TrendingUp, Star, MessageSquare, Users, 
  Loader, AlertCircle, ArrowRight, Clock, BookOpen 
} from 'lucide-react';

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
      if (!user?._id) return;
      
      try {
        setLoading(true);
        setError(null);

        // Fetch data in parallel for better performance and resilience
        const [sessionsRes, ratingsRes, feedbacksRes, allStudentsRes] = await Promise.allSettled([
          customFetch.get(`/tutoring-sessions/tutor/${user._id}`),
          customFetch.get(`/feedbacks/tutor/${user._id}/ratings`),
          customFetch.get(`/feedbacks/tutor/${user._id}`),
          customFetch.get(`/tutors/students/all`)
        ]);

        // 1. Process Sessions
        let allSessions = [];
        if (sessionsRes.status === 'fulfilled') {
          allSessions = sessionsRes.value.data.sessions || [];
        } else if (sessionsRes.reason?.response?.status !== 404) {
          console.error('Sessions fetch failed:', sessionsRes.reason);
        }

        const now = new Date();
        const upcomingSessionsList = allSessions
          .filter(s => new Date(s.schedule?.date || s.scheduledDate) > now)
          .sort((a, b) => new Date(a.schedule?.date || a.scheduledDate) - new Date(b.schedule?.date || b.scheduledDate));

        // 2. Process Ratings
        let avgRating = 0;
        if (ratingsRes.status === 'fulfilled') {
          avgRating = ratingsRes.value.data.avgRating || 0; // Fix: was averageRating incorrectly mapped
        } else if (ratingsRes.reason?.response?.status !== 404) {
          console.error('Ratings fetch failed:', ratingsRes.reason);
        }

        // 3. Process Feedbacks
        let feedbacksCount = 0;
        if (feedbacksRes.status === 'fulfilled') {
          feedbacksCount = feedbacksRes.value.data.feedbacks?.length || 0;
        } else if (feedbacksRes.reason?.response?.status !== 404) {
          console.error('Feedbacks fetch failed:', feedbacksRes.reason);
        }
        
        // Process total platform students
        let platformStudents = 0;
        if (allStudentsRes.status === 'fulfilled') {
          platformStudents = allStudentsRes.value.data.count || 0;
        } else if (allStudentsRes.reason?.response?.status !== 404) {
          console.error('All Students fetch failed:', allStudentsRes.reason);
        }

        setStats({
          upcomingSessions: upcomingSessionsList.length,
          studentsCount: platformStudents, // Force global total as requested by user
          averageRating: parseFloat(avgRating),
          feedbacksCount,
          nextSessions: upcomingSessionsList.slice(0, 2),
        });

      } catch (err) {
        console.error('Unexpected dashboard error:', err);
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
                          {(session.title && String(session.title).trim()) ||
                            session.subject ||
                            'Tutoring Session'}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4">

        <div 
          onClick={() => onNavigate?.('My Sessions')} 
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-indigo-500 hover:shadow-lg transition-all group shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">My Sessions</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-left">View and manage your tutoring sessions</p>
        </div>

        <div 
          onClick={() => onNavigate?.('Student Progress')} 
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all group shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">Student Progress</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-left">Track and update progress</p>
        </div>

        <div 
          onClick={() => onNavigate?.('Your Ratings')} 
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-amber-500 hover:shadow-lg transition-all group shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors text-amber-600 dark:text-amber-400">
              <Star className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-amber-600 transition-colors" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">Your Ratings</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-left">View rating statistics</p>
        </div>

        <div 
          onClick={() => onNavigate?.('Feedbacks')} 
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-purple-500 hover:shadow-lg transition-all group shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors text-purple-600 dark:text-purple-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-purple-600 transition-colors" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">Feedbacks</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-left">Read feedback from students</p>
        </div>
        
        <div 
          onClick={() => onNavigate?.('study-materials')} 
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-indigo-500 hover:shadow-lg transition-all group shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-400"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">Study Materials</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed text-left">Upload and manage learning resources</p>
        </div>
      </div>

    </div>
  );
}