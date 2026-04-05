import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Loader, AlertCircle, BookOpen, Plus, Edit, Trash2 } from 'lucide-react';
import customFetch from '../../../utils/customfetch';
import { SessionForm } from '../../../components/tutoringSessions';

export default function MySessions({ user }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  useEffect(() => {
    if (user?._id) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data } = await customFetch.get('/tutoring-sessions');
      const filteredSessions = (data.sessions || []).filter(s => 
        String(s.tutor?._id || s.tutor) === String(user?._id)
      );
      setSessions(filteredSessions.sort((a, b) => 
        new Date(b.schedule?.date || b.scheduledDate) - new Date(a.schedule?.date || a.scheduledDate)
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSession(null);
    setIsFormOpen(true);
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setIsFormOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      // Transform form data to match API schema
      const apiData = {
        subject: formData.subject,
        description: formData.description,
        schedule: {
          date: new Date(formData.schedule.date),
          startTime: formData.schedule.startTime,
          endTime: formData.schedule.endTime,
        },
        capacity: {
          maxParticipants: formData.capacity.maxParticipants,
        },
        level: formData.level,
        tags: formData.tags,
      };

      if (editingSession) {
        await customFetch.put(`/tutoring-sessions/${editingSession._id}`, apiData);
      } else {
        await customFetch.post('/tutoring-sessions', {
          ...apiData,
          tutor: user._id,
        });
      }
      setIsFormOpen(false);
      setEditingSession(null);
      await fetchSessions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save session');
    }
  };

  const handleDelete = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await customFetch.delete(`/tutoring-sessions/${sessionId}`);
        setSessions(sessions.filter(s => s._id !== sessionId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete session');
      }
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingSession(null);
  };

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
          <p className="text-gray-600 dark:text-gray-400">Create and manage your tutoring sessions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg px-4 py-2">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
              {sessions.length} {sessions.length === 1 ? 'Session' : 'Sessions'}
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            New Session
          </button>

        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-700 dark:text-red-400 font-semibold text-sm hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-linear-to-br from-emerald-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Sessions Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Start by creating your first tutoring session</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Your First Session
          </button>

        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => {
            const status = getSessionStatus(session.schedule?.date || session.scheduledDate);
            const sessionDate = new Date(session.schedule?.date || session.scheduledDate);
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
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        {session.studentId?.fullName || session.subject || 'Untitled Session'}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{dateStr}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{session.schedule?.startTime || '--:--'} - {session.schedule?.endTime || '--:--'}</span>
                        </div>
                        {(session.topic || session.description) && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span>{session.topic || session.subject}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      status === 'Upcoming'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {status}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(session)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit session"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(session._id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Session Form Modal */}
      <SessionForm
        session={editingSession}
        onSave={handleSave}
        onCancel={handleCancel}
        isOpen={isFormOpen}
      />
    </div>
  );
}
