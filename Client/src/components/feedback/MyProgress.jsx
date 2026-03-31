import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, TrendingUp } from 'lucide-react';
import ProgressCard from './ProgressCard';
import customFetch from '../../utils/customfetch';

export default function MyProgress() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, high, medium, low

  useEffect(() => {
    const fetchMyProgress = async () => {
      try {
        setLoading(true);
        const { data } = await customFetch.get('/progress/me');
        setProgress(data.progress || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load progress');
      } finally {
        setLoading(false);
      }
    };

    fetchMyProgress();
  }, []);

  const getFilteredProgress = () => {
    switch (filter) {
      case 'high':
        return progress.filter((p) => p.completionPercent >= 80);
      case 'medium':
        return progress.filter((p) => p.completionPercent >= 40 && p.completionPercent < 80);
      case 'low':
        return progress.filter((p) => p.completionPercent < 40);
      default:
        return progress;
    }
  };

  const filteredProgress = getFilteredProgress();
  const avgCompletion =
    progress.length > 0
      ? Math.round(progress.reduce((sum, p) => sum + p.completionPercent, 0) / progress.length)
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Progress</h2>
          <p className="text-gray-600 dark:text-gray-400">Track your learning progress</p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg px-4 py-2">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
            Avg: {avgCompletion}%
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      {progress.length > 0 && (
        <div className="flex gap-2 mb-4">
          {[
            { id: 'all', label: 'All' },
            { id: 'high', label: 'On Track (80-100%)' },
            { id: 'medium', label: 'In Progress (40-79%)' },
            { id: 'low', label: 'Needs Attention (<40%)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Progress Items */}
      {progress.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No progress records yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your tutors will start tracking your progress
          </p>
        </div>
      ) : filteredProgress.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">No progress records in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProgress.map((prog) => (
            <ProgressCard key={prog._id} progress={prog} showTutorInfo={true} />
          ))}
        </div>
      )}
    </div>
  );
}
