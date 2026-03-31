import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, TrendingUp } from 'lucide-react';
import ProgressCard from './ProgressCard';import customFetch from '../../utils/customfetch';
export default function AdminProgress() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, high, medium, low
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Since there's no dedicated admin endpoint for all progress, we'll fetch from a general view
    // This assumes either we create a new endpoint or use pagination
    const fetchAllProgress = async () => {
      try {
        setLoading(true);
        // Note: You may need to create a /api/progress endpoint for admins to view all
        const { data } = await customFetch.get('/progress');
        setProgress(data.progress || []);
      } catch (err) {
        if (err.response?.status === 404) {
          // Fallback if endpoint doesn't exist
          setProgress([]);
        } else {
          setError(err.response?.data?.message || err.message || 'Failed to load progress');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllProgress();
  }, []);

  const getFilteredProgress = () => {
    let filtered = progress;

    // Completion filter
    switch (filter) {
      case 'high':
        filtered = filtered.filter((p) => p.completionPercent >= 80);
        break;
      case 'medium':
        filtered = filtered.filter((p) => p.completionPercent >= 40 && p.completionPercent < 80);
        break;
      case 'low':
        filtered = filtered.filter((p) => p.completionPercent < 40);
        break;
      default:
        break;
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.student?.fullName?.toLowerCase().includes(search) ||
          p.tutor?.fullName?.toLowerCase().includes(search) ||
          p.topic?.toLowerCase().includes(search)
      );
    }

    return filtered;
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            All Student Progress
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Monitor all student learning progress</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">Average</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{avgCompletion}%</p>
          <p className="text-xs text-gray-500">{progress.length} Records</p>
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
          placeholder="Search by student, tutor, or topic..."
          className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filter Tabs */}
      {progress.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {[
            { id: 'all', label: 'All Records' },
            { id: 'high', label: 'Excellent (80-100%)' },
            { id: 'medium', label: 'In Progress (40-79%)' },
            { id: 'low', label: 'Needs Help (<40%)' },
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
            No progress records
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Progress records will appear here</p>
        </div>
      ) : filteredProgress.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">No records match your filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProgress.map((prog) => (
            <ProgressCard
              key={prog._id}
              progress={prog}
              showTutorInfo={true}
              showStudentInfo={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
