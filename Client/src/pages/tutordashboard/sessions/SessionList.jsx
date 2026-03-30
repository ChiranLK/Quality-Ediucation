// src/pages/tutordashboard/sessions/SessionList.jsx
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useSessions } from '../../../hooks/useSessions';
import SessionCard from '../../../components/tutoringSessions/SessionCard';
import SessionForm from '../../../components/tutoringSessions/SessionForm';

const SessionList = ({ tutorId, onViewDetails }) => {
  const { sessions, loading, error, createSession, updateSession, deleteSession } = useSessions(tutorId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  const handleCreate = () => {
    setEditingSession(null);
    setIsFormOpen(true);
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setIsFormOpen(true);
  };

  const handleSave = async (sessionData) => {
    try {
      if (editingSession) {
        await updateSession(editingSession.id, sessionData);
      } else {
        await createSession(sessionData);
      }
      setIsFormOpen(false);
      setEditingSession(null);
    } catch (err) {
      // Error is handled in the hook
    }
  };

  const handleDelete = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await deleteSession(sessionId);
      } catch (err) {
        // Error is handled in the hook
      }
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingSession(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Error loading sessions: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Sessions</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage your tutoring sessions</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Session
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No sessions found.</p>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Create Your First Session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}

      <SessionForm
        session={editingSession}
        onSave={handleSave}
        onCancel={handleCancel}
        isOpen={isFormOpen}
      />
    </div>
  );
};

export default SessionList;