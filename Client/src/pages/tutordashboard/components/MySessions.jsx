import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Loader, AlertCircle, BookOpen } from 'lucide-react';
import customFetch from '../../../utils/customfetch';

export default function MySessions({ user }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const { data } = await customFetch.get('/tutoring-sessions');
        const filteredSessions = (data.sessions || []).filter(s => 
          String(s.tutorId?._id || s.tutorId) === String(user?._id)
        );
        setSessions(filteredSessions.sort((a, b) => 
          new Date(b.scheduledDate) - new Date(a.scheduledDate)
        ));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchSessions();
    }
  }, [user]);

  const getSessionStatus = (date) => {
    const now = new Date();
    const sessionDate = new Date(date);
    return sessionDate > now ? 'Upcoming' : 'Completed';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Sessions</h2>
          <p className="text-gray-600 dark:text-gray-400">View all your tutoring sessions</p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg px-4 py-2">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
            {sessions.length} {sessions.length === 1 ? 'Session' : 'Sessions'}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Sessions Yet</h3>
          <p className="text-gray-600 dark:text-gray-400">You don't have any scheduled sessions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => {
            const status = getSessionStatus(session.scheduledDate);
            const sessionDate = new Date(session.scheduledDate);
            const dateStr = sessionDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: sessionDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
            });
            const timeStr = sessionDate.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            });

            return (
              <div key={session._id} className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        {session.studentId?.fullName || 'Unknown Student'}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{dateStr}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{timeStr}</span>
                        </div>
                        {session.topic && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span>{session.topic}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    status === 'Upcoming'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
