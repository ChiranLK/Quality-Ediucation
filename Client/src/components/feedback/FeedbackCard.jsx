import React from 'react';
import { MessageCircle, User } from 'lucide-react';
import RatingStars from './RatingStars';
import { formatDistanceToNow } from 'date-fns';

export default function FeedbackCard({ feedback, showStudent = false }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white">
            <User size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {showStudent ? feedback.student?.fullName : feedback.tutor?.fullName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <RatingStars rating={feedback.rating} size="sm" />
          <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
            {feedback.rating}/5
          </span>
        </div>
      </div>

      {/* Message */}
      {feedback.message && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {feedback.message}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
        <MessageCircle size={14} />
        <span>{feedback.message ? 'Feedback received' : 'No message'}</span>
      </div>
    </div>
  );
}
