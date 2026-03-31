import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, MessageSquare } from 'lucide-react';
import FeedbackCard from './FeedbackCard';
import customFetch from '../../utils/customfetch';

export default function MyFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyFeedbacks = async () => {
      try {
        setLoading(true);
        const { data } = await customFetch.get('/feedbacks/me');
        setFeedbacks(data.feedbacks || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load feedbacks');
      } finally {
        setLoading(false);
      }
    };

    fetchMyFeedbacks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Feedbacks</h2>
          <p className="text-gray-600 dark:text-gray-400">Feedback you've submitted to tutors</p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg px-4 py-2">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
            {feedbacks.length} {feedbacks.length === 1 ? 'Feedback' : 'Feedbacks'}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {feedbacks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No feedbacks yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start rating tutors to help improve the platform
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbacks.map((feedback) => (
            <FeedbackCard key={feedback._id} feedback={feedback} />
          ))}
        </div>
      )}
    </div>
  );
}
