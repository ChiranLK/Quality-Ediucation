import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, MessageSquare, Filter } from 'lucide-react';
import FeedbackCard from './FeedbackCard';import customFetch from '../../utils/customfetch';
export default function AllFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingFilter, setRatingFilter] = useState('all'); // all, 5, 4, 3, 2, 1
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllFeedbacks = async () => {
      try {
        setLoading(true);
        const { data } = await customFetch.get('/feedbacks');
        setFeedbacks(data.feedbacks || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load feedbacks');
      } finally {
        setLoading(false);
      }
    };

    fetchAllFeedbacks();
  }, []);

  const getFilteredFeedbacks = () => {
    let filtered = feedbacks;

    // Rating filter
    if (ratingFilter !== 'all') {
      filtered = filtered.filter((f) => f.rating === parseInt(ratingFilter));
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.student?.fullName?.toLowerCase().includes(search) ||
          f.tutor?.fullName?.toLowerCase().includes(search) ||
          f.message?.toLowerCase().includes(search)
      );
    }

    return filtered;
  };

  const filteredFeedbacks = getFilteredFeedbacks();
  const avgRating =
    feedbacks.length > 0
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : 0;

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            All Feedbacks
          </h2>
          <p className="text-gray-600 dark:text-gray-400">View all system feedbacks</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{feedbacks.length}</p>
          <p className="text-xs text-gray-500">Avg: {avgRating} ⭐</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by student, tutor, or message..."
          className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Rating:</span>
        </div>
        {['all', 5, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            onClick={() => setRatingFilter(rating.toString())}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
              ratingFilter === rating.toString()
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {rating === 'all' ? 'All' : `${rating}★`}
          </button>
        ))}
      </div>

      {/* Feedbacks Grid */}
      {feedbacks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No feedbacks in system
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Feedbacks will appear here</p>
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">No feedbacks match your filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFeedbacks.map((feedback) => (
            <FeedbackCard
              key={feedback._id}
              feedback={feedback}
              showStudent={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
