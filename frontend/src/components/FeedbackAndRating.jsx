import React, { useState, useEffect } from 'react';
import { Star, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { feedbackAPI, tutorsAPI } from '../services/api';

export default function FeedbackAndRating() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [tutorsLoading, setTutorsLoading] = useState(true);
  const [formData, setFormData] = useState({
    tutorId: '',
    rating: 0,
    comment: '',
  });

  // Fetch tutors on component mount
  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const response = await tutorsAPI.getAllTutors();
      console.log('Tutors response:', response.data);
      setTutors(response.data.tutors || []);
    } catch (err) {
      console.error('Failed to fetch tutors:', err);
      setError('Failed to load tutors. Please refresh the page.');
    } finally {
      setTutorsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.tutorId || formData.rating === 0 || !formData.comment.trim()) {
        setError('Please fill all required fields');
        setLoading(false);
        return;
      }

      await feedbackAPI.submitFeedback({
        tutorId: formData.tutorId,
        rating: formData.rating,
        message: formData.comment,
      });

      setSubmitted(true);
      setFormData({
        tutorId: '',
        rating: 0,
        comment: '',
      });

      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Feedback submission error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to submit feedback';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, onChange, size = 'md' }) => {
    const sizes = {
      sm: 'w-5 h-5',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    };

    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`${sizes[size]} cursor-pointer transition-transform hover:scale-110`}
          >
            <Star
              className={`w-full h-full ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {submitted && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800">Thank you! Your feedback has been submitted successfully.</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Feedback Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Star className="w-6 h-6 text-yellow-400" />
          Submit Feedback & Rating
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tutor Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Tutor *
            </label>
            {tutorsLoading ? (
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600">
                Loading tutors...
              </div>
            ) : tutors.length === 0 ? (
              <div className="w-full px-4 py-2 border border-red-300 rounded-lg bg-red-50 text-red-600">
                No tutors available
              </div>
            ) : (
              <select
                name="tutorId"
                value={formData.tutorId}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="">Choose a tutor...</option>
                {tutors.map(tutor => (
                  <option key={tutor._id} value={tutor._id}>
                    {tutor.fullName} - {tutor.tutorProfile?.subjects?.join(', ') || 'N/A'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Overall Rating *
            </label>
            <StarRating
              value={formData.rating}
              onChange={(rating) =>
                setFormData(prev => ({ ...prev, rating }))
              }
              size="lg"
            />
            <p className="text-sm text-gray-600 mt-2">
              {formData.rating > 0 ? `You rated: ${formData.rating} out of 5 stars` : 'Select a rating'}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Feedback *
            </label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              placeholder="Share your experience with this tutor. What did they do well? Any suggestions for improvement?"
              className="textarea"
              rows="5"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.comment.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Submitting...
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
    </div>
  );
}
