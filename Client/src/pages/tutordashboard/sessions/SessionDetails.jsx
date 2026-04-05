// src/pages/tutordashboard/sessions/SessionDetails.jsx
import { useState, useEffect } from 'react';
import { ArrowLeft, CalendarDays, Clock, Users, MapPin, FileText } from 'lucide-react';
import { sessionService } from '../../../services/sessionService';

const SessionDetails = ({ sessionId, onBack }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const data = await sessionService.getSessionDetails(sessionId);
        setSession(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSessionDetails();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Error loading session details: {error}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {session.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{session.subject}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
/* Session Info */
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wide text-xs">
              Session Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">Date</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatDate(session.date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">Time</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatTime(session.startTime)} - {formatTime(session.endTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">Students</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {session.enrolledStudents}/{session.maxStudents} enrolled
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">Location</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {session.location || 'Online'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {session.description && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide text-xs">
                  Description
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {session.description}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-wide text-[10px]">Status</h3>
            <span className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full ${
              session.status === 'upcoming'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                : session.status === 'ongoing'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300'
            }`}>
              {session.status}
            </span>
          </div>

          {/* Enrolled Students */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wide text-[10px]">Enrolled Students</h3>
            {session.students && session.students.length > 0 ? (
              <div className="space-y-3">
                {session.students.map((student) => (
                  <div key={student.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{student.name}</span>
                  </div>
                ))}
              </div>

            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No students enrolled yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetails;