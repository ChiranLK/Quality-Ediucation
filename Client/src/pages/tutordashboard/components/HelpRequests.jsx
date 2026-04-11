import React, { useEffect } from 'react';
import { MessageSquare, Loader, AlertCircle, BookOpen, Filter, ChevronDown } from 'lucide-react';
import customFetch from '../../../utils/customfetch';
import { useTutorHelpRequestsStore } from '../../../stores/helpRequestStore';

export default function HelpRequests({ user }) {
  // Zustand store hooks
  const requests = useTutorHelpRequestsStore((state) => state.requests);
  const loading = useTutorHelpRequestsStore((state) => state.loading);
  const error = useTutorHelpRequestsStore((state) => state.error);
  const expandedId = useTutorHelpRequestsStore((state) => state.expandedId);
  const selectedCategory = useTutorHelpRequestsStore((state) => state.selectedCategory);
  const selectedLanguage = useTutorHelpRequestsStore((state) => state.selectedLanguage);

  // Zustand store actions
  const setRequests = useTutorHelpRequestsStore((state) => state.setRequests);
  const setLoading = useTutorHelpRequestsStore((state) => state.setLoading);
  const setError = useTutorHelpRequestsStore((state) => state.setError);
  const setExpandedId = useTutorHelpRequestsStore((state) => state.setExpandedId);
  const setSelectedCategory = useTutorHelpRequestsStore((state) => state.setSelectedCategory);
  const setSelectedLanguage = useTutorHelpRequestsStore((state) => state.setSelectedLanguage);

  const categories = [
    'All',
    'Mathematics',
    'Science',
    'IT & Programming',
    'English',
    'History',
    'Geography',
    'Physics',
    'Chemistry',
    'Other'
  ];

  const languages = [
    'All',
    'English',
    'Sinhala',
    'Tamil',
    'French'
  ];

  useEffect(() => {
    fetchHelpRequests();
  }, []);

  const fetchHelpRequests = async () => {
    try {
      setLoading(true);
      const { data } = await customFetch.get('/messages');
      setRequests(data.messages || []);
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || 'Failed to load help requests');
      console.error('Error fetching help requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const categoryMatch = selectedCategory === 'All' || request.category === selectedCategory;
    const languageMatch = selectedLanguage === 'All' || request.language === selectedLanguage;
    return categoryMatch && languageMatch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Mathematics': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      'Science': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      'IT & Programming': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
      'English': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
      'History': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      'Geography': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
      'Physics': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
      'Chemistry': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
      'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    };
    return colors[category] || colors['Other'];
  };

  const getLanguageColor = (language) => {
    const colors = {
      'English': 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
      'Sinhala': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
      'Tamil': 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
      'French': 'bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300'
    };
    return colors[language] || colors['English'];
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Loading help requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-300">Error</h3>
            <p className="text-red-700 dark:text-red-400 text-sm mt-1">{error}</p>
            <button
              onClick={fetchHelpRequests}
              className="mt-3 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Help Requests</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Browse and respond to student questions and help requests</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg appearance-none cursor-pointer text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Language</label>
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg appearance-none cursor-pointer text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredRequests.length} of {requests.length} help request{requests.length !== 1 ? 's' : ''}
      </div>

      {/* Help Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">No help requests found</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">Try adjusting your filters or check back later</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <div
              key={request._id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md dark:hover:shadow-gray-900/50 transition-all"
            >
              <button
                onClick={() => setExpandedId(expandedId === request._id ? null : request._id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base line-clamp-2">
                        {request.title}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${getCategoryColor(request.category)}`}>
                        {request.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 flex-wrap">
                      <span>By: {request.createdBy?.fullName || 'Anonymous'}</span>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span>{formatDate(request.createdAt)}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getLanguageColor(request.language)}`}>
                        {request.language}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0 transition-transform ${
                      expandedId === request._id ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Expanded Content */}
              {expandedId === request._id && (
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-900/50">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">Message</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                        {request.message}
                      </p>
                    </div>
                    {request.imageUrl && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Attachment</h4>
                        <img
                          src={request.imageUrl}
                          alt="Help request attachment"
                          className="max-w-full h-64 object-cover rounded border border-gray-200 dark:border-gray-700"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
