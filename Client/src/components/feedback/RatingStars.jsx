import React from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({ rating, onRate, interactive = false, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const starSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            interactive && onRate?.(star);
          }}
          disabled={!interactive}
          className={`${starSize} transition-all ${
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          }`}
        >
          <Star
            className={`w-full h-full ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
