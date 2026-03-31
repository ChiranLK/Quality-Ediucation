import React from 'react';
import { Star, Users } from 'lucide-react';
import RatingStars from './RatingStars';

export default function RatingStats({ stats }) {
  const totalRatings = stats.totalRatings || 0;
  const avgRating = stats.avgRating || 0;
  const breakdown = stats.breakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  const getPercentage = (count) => {
    return totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Main Rating */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-2xl text-gray-500 dark:text-gray-400">/ 5.0</span>
          </div>
          <RatingStars rating={Math.round(avgRating)} size="md" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-2">
            <Users size={20} />
            <span className="text-lg font-semibold">{totalRatings}</span>
          </div>
        </div>
      </div>

      {/* Rating Breakdown */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = breakdown[rating] || 0;
          const percentage = getPercentage(count);
          return (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {rating}
                </span>
              </div>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-yellow-400 h-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* No ratings message */}
      {totalRatings === 0 && (
        <div className="text-center py-6">
          <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400">No ratings yet</p>
        </div>
      )}
    </div>
  );
}
