import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import RatingStars from './RatingStars';
import customFetch from '../../utils/customfetch';

export default function SubmitFeedback({ tutorId: initialTutorId, tutorName: initialTutorName, sessionId, onSuccess }) {
  const [selectedTutorId, setSelectedTutorId] = useState(initialTutorId || '');
  const [selectedTutorName, setSelectedTutorName] = useState(initialTutorName || '');
  const [tutors, setTutors] = useState([]);
  const [loadingTutors, setLoadingTutors] = useState(true);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Fetch tutors from database
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoadingTutors(true);
        // Fetch all tutors from database
        const { data } = await customFetch.get('/tutors');
        
        if (data.tutors && Array.isArray(data.tutors)) {
          setTutors(data.tutors);
        } else if (Array.isArray(data)) {
          setTutors(data);
        } else {
          setTutors([]);
        }
      } catch (err) {
        console.error('Failed to fetch tutors:', err);
        setTutors([]);
      } finally {
        setLoadingTutors(false);
      }
    };

    if (!initialTutorId) {
      fetchTutors();
    }
  }, [initialTutorId]);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (status?.type === 'success') {
      const timer = setTimeout(() => {
        setStatus(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSelectTutor = (tutor) => {
    setSelectedTutorId(tutor._id);
    setSelectedTutorName(tutor.fullName || tutor.name || tutor.email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedTutorId) {
      setStatus({ type: 'error', msg: 'Please select a tutor' });
      return;
    }

    if (rating === 0) {
      setStatus({ type: 'error', msg: 'Please select a rating (1-5 stars)' });
      return;
    }

    setLoading(true);
    setStatus(null);
    setSubmitted(false);

    try {
      const { data } = await customFetch.post('/feedbacks', {
        tutorId: selectedTutorId,
        rating,
        message: message.trim(),
        ...(sessionId && { sessionId }),
      });

      if (data) {
        setSubmitted(true);
        setStatus({ type: 'success', msg: 'Feedback submitted successfully! ✓' });
        // Reset form after successful submission
        setTimeout(() => {
          setRating(0);
          setMessage('');
          setSelectedTutorId('');
          setSelectedTutorName('');
          setStatus(null);
          setSubmitted(false);
          onSuccess?.();
        }, 1500);
      }
    } catch (error) {
      setStatus({ type: 'error', msg: error.response?.data?.message || 'Failed to submit feedback' });
    } finally {
      setLoading(false);
    }
  };

  // If tutorId is pre-selected (e.g., from sessions), show simple form
  if (initialTutorId) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Rate Tutor: <span className="text-blue-600 dark:text-blue-400">{initialTutorName}</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Rating Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <div onClick={(e) => e.stopPropagation()}>
              <RatingStars rating={rating} onRate={setRating} interactive={true} size="lg" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Click to rate from 1 to 5 stars
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Your Feedback (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
              placeholder="Share your experience with this tutor..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {message.length} / 2000 characters
            </p>
          </div>

          {/* Status Messages */}
          {status && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              status.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              {status.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="text-sm">{status.msg}</p>
            </div>
          )}

          {/* Submit Button - Disabled until rating is selected */}
          <button
            type="submit"
            disabled={loading || rating === 0 || submitted}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : submitted ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Submitted
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Feedback
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // Tutor selector view
  return (
    <div className="space-y-6">
      {/* Select Tutor - shrink when tutor is selected */}
      {!selectedTutorId && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Select a Tutor</h3>
          
          {loadingTutors ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
          ) : tutors.length === 0 ? (
            <div className="p-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mb-2" />
              <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                No tutors available at the moment. Please try again later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tutors.map(tutor => (
                <button
                  key={tutor._id}
                  onClick={() => handleSelectTutor(tutor)}
                  className={`p-4 border-2 rounded-lg transition-colors text-left ${
                    selectedTutorId === tutor._id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {tutor.fullName || tutor.name || tutor.email}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {tutor.email}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feedback Form - shows when tutor is selected */}
      {selectedTutorId && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Rate Tutor: <span className="text-blue-600 dark:text-blue-400">{selectedTutorName}</span>
            </h2>
            <button
              type="button"
              onClick={() => {
                setSelectedTutorId('');
                setSelectedTutorName('');
                setRating(0);
                setMessage('');
                setStatus(null);
              }}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-semibold"
            >
              ← Change Tutor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Rating Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Your Rating <span className="text-red-500">*</span>
              </label>
              <div onClick={(e) => e.stopPropagation()}>
                <RatingStars rating={rating} onRate={setRating} interactive={true} size="lg" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Click to rate from 1 to 5 stars
              </p>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Your Feedback (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={2000}
                placeholder="Share your experience with this tutor..."
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {message.length} / 2000 characters
              </p>
            </div>

            {/* Status Messages */}
            {status && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                status.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {status.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <p className="text-sm">{status.msg}</p>
              </div>
            )}

            {/* Submit Button - Disabled until rating is selected */}
            <button
              type="submit"
              disabled={loading || rating === 0 || submitted}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : submitted ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Submitted
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
