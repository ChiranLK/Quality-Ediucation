import React from 'react';
import { TrendingUp, BookOpen, User, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ProgressCard({ progress, showTutorInfo = false, showStudentInfo = false }) {
  const completionPercent = progress.completionPercent || 0;
  const getStatusColor = (percent) => {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 60) return 'bg-blue-500';
    if (percent >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusLabel = (percent) => {
    if (percent >= 80) return 'Excellent Progress';
    if (percent >= 60) return 'Good Progress';
    if (percent >= 40) return 'On Track';
    return 'Needs Attention';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={18} className="text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {progress.topic || 'General Progress'}
            </h3>
          </div>
          {showTutorInfo && progress.tutor && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tutor: {progress.tutor.fullName}
            </p>
          )}
          {showStudentInfo && progress.student && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Student: {progress.student.fullName}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Updated {formatDistanceToNow(new Date(progress.updatedAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {getStatusLabel(completionPercent)}
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {completionPercent}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`${getStatusColor(completionPercent)} h-full transition-all duration-300`}
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Notes */}
      {progress.notes && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {progress.notes}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <TrendingUp size={14} />
        <span>Completion tracked</span>
      </div>
    </div>
  );
}
