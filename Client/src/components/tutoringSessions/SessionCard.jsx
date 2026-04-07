// src/components/tutoringSessions/SessionCard.jsx
import { CalendarDays, Clock, Users, Edit, Trash2 } from 'lucide-react';

const SessionCard = ({ session, onEdit, onDelete, onViewDetails }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {session.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {session.subject}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(session)}
            className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(session.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <CalendarDays className="w-4 h-4" />
          <span>{formatDate(session.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Clock className="w-4 h-4" />
          <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Users className="w-4 h-4" />
          <span>{session.enrolledStudents}/{session.maxStudents} students</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
          session.status === 'upcoming'
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
            : session.status === 'ongoing'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300'
        }`}>
          {session.status}
        </span>
        <button
          onClick={() => onViewDetails(session.id)}
          className="text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default SessionCard;