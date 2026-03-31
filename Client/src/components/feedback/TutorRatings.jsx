import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import RatingStats from './RatingStats';import customFetch from '../../utils/customfetch';
export default function TutorRatings({ tutorId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRatingStats = async () => {
      try {
        setLoading(true);
        const { data } = await customFetch.get(`/feedbacks/tutor/${tutorId}/ratings`);
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load rating stats');
      } finally {
        setLoading(false);
      }
    };

    if (tutorId) {
      fetchRatingStats();
    }
  }, [tutorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
        <AlertCircle size={18} />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Rating</h2>
        <p className="text-gray-600 dark:text-gray-400">Overall performance and student feedback</p>
      </div>

      {stats && <RatingStats stats={stats} />}
    </div>
  );
}
