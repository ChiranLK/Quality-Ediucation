import React, { useState, useEffect } from 'react';
import { Star, Award, TrendingUp, Filter, ChevronDown, Trash2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { tutorsAPI, feedbackAPI } from '../services/api';
import axios from 'axios';

export default function ViewRatings() {
  const [tutors, setTutors] = useState([]);
  const [allFeedback, setAllFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('rating');
  const [filterSubject, setFilterSubject] = useState('all');
  const [subjects, setSubjects] = useState([]);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'detailed'
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const adminToken = localStorage.getItem('adminAuthToken');
    setIsAdmin(!!adminToken);
    fetchTutorsAndRatings();
  }, []);

  const fetchTutorsAndRatings = async () => {
    try {
      setLoading(true);
      const tutorResponse = await tutorsAPI.getAllTutors();
      console.log('[ViewRatings] Tutor response:', tutorResponse.data);
      const tutorsList = tutorResponse.data.tutors || [];
      setTutors(tutorsList);

      // Extract unique subjects
      const uniqueSubjects = new Set();
      tutorsList.forEach(tutor => {
        tutor.tutorProfile?.subjects?.forEach(subject =>
          uniqueSubjects.add(subject)
        );
      });
      setSubjects(Array.from(uniqueSubjects));

      // Fetch all feedback if admin
      const adminToken = localStorage.getItem('adminAuthToken');
      if (adminToken) {
        try {
          const feedbackResponse = await feedbackAPI.getAllFeedbacks();
          console.log('[ViewRatings] Feedback response:', feedbackResponse.data);
          setAllFeedback(feedbackResponse.data.feedbacks || feedbackResponse.data || []);
        } catch (err) {
          console.error('Failed to fetch detailed feedback:', err);
        }
      }
    } catch (error) {
      console.error('Failed to fetch tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTutorName = (tutorId) => {
    const tutor = tutors.find(t => t._id === tutorId);
    return tutor?.fullName || 'Unknown Tutor';
  };

  const handleDeleteFeedback = async (feedbackId) => {
    try {
      const token = localStorage.getItem('adminAuthToken');
      await axios.delete(`http://localhost:5000/api/feedbacks/${feedbackId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAllFeedback(allFeedback.filter(f => f._id !== feedbackId));
      setDeleteConfirm(null);
      await fetchTutorsAndRatings();
    } catch (error) {
      console.error('Failed to delete feedback:', error);
      alert('Failed to delete feedback');
    }
  };

  const getSortedAndFilteredTutors = () => {
    let filtered = [...tutors];

    if (filterSubject !== 'all') {
      filtered = filtered.filter(tutor =>
        tutor.tutorProfile?.subjects?.includes(filterSubject)
      );
    }

    filtered.sort((a, b) => {
      const ratingA = a.tutorProfile?.rating?.average || 0;
      const ratingB = b.tutorProfile?.rating?.average || 0;
      const countA = a.tutorProfile?.rating?.count || 0;
      const countB = b.tutorProfile?.rating?.count || 0;

      if (sortBy === 'rating') {
        return ratingB - ratingA;
      } else if (sortBy === 'reviews') {
        return countB - countA;
      } else if (sortBy === 'name') {
        return a.fullName.localeCompare(b.fullName);
      }
      return 0;
    });

    return filtered;
  };

  const RatingStars = ({ rating, showValue = true }) => (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {showValue && (
        <span className="font-semibold text-gray-800">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );

  const RatingBar = ({ value, max = 5 }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  );

  const TutorRatingCard = ({ tutor }) => {
    const rating = tutor.tutorProfile?.rating || {};
    const avgRating = rating.average || 0;
    const totalRatings = rating.count || 0;

    return (
      <div className="card mb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 flex items-center gap-4">
            {tutor.avatar ? (
              <img
                src={tutor.avatar}
                alt={tutor.fullName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                {tutor.fullName?.[0]}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-800">
                  {tutor.fullName}
                </h3>
                {tutor.tutorProfile?.isVerified && (
                  <span className="badge badge-success">Verified</span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <RatingStars rating={avgRating} showValue={false} />
                <span className="text-sm font-semibold text-gray-700">
                  {avgRating.toFixed(1)}/5
                </span>
                <span className="text-sm text-gray-500">
                  ({totalRatings} reviews)
                </span>
              </div>
              {tutor.tutorProfile?.subjects && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tutor.tutorProfile.subjects.map(subject => (
                    <span key={subject} className="badge badge-primary text-xs">
                      {subject}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {avgRating.toFixed(1)}
            </div>
            <p className="text-xs font-medium text-gray-600">out of 5</p>
          </div>
        </div>

        {tutor.tutorProfile?.bio && (
          <p className="text-sm text-gray-600 mb-4">
            {tutor.tutorProfile.bio}
          </p>
        )}

        {/* Rating Distribution */}
        <div className="space-y-3 mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Rating Breakdown
          </p>
          {[5, 4, 3, 2, 1].map(stars => (
            <div key={stars} className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-600 w-8">
                {stars} ⭐
              </span>
              <RatingBar value={Math.random() * 5} max={5} />
              <span className="text-xs text-gray-600 w-10 text-right">
                {Math.floor(Math.random() * 20)}%
              </span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-blue-50 rounded-lg">
          <div className="text-center">
            <TrendingUp className="w-4 h-4 mx-auto text-blue-600 mb-1" />
            <p className="text-xs font-semibold">{tutor.tutorProfile?.sessionCount || 0}</p>
            <p className="text-xs text-gray-600">Sessions</p>
          </div>
          <div className="text-center">
            <Award className="w-4 h-4 mx-auto text-amber-600 mb-1" />
            <p className="text-xs font-semibold">{tutor.tutorProfile?.experience || 0}y</p>
            <p className="text-xs text-gray-600">Experience</p>
          </div>
          <div className="text-center">
            <Star className="w-4 h-4 mx-auto text-yellow-500 mb-1" />
            <p className="text-xs font-semibold">{totalRatings}</p>
            <p className="text-xs text-gray-600">Reviews</p>
          </div>
          <div className="text-center">
            <div className="w-4 h-4 mx-auto bg-green-500 rounded-full mb-1" />
            <p className="text-xs font-semibold">
              {tutor.tutorProfile?.availability === 'available' ? 'Free' : 'Busy'}
            </p>
            <p className="text-xs text-gray-600">Status</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading ratings...</p>
        </div>
      </div>
    );
  }

  const filteredTutors = getSortedAndFilteredTutors();

  const DetailedFeedbackView = () => (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <div className="text-center mb-4">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-gray-800">Delete Review?</h3>
                <p className="text-gray-600 mt-2">
                  Are you sure you want to delete this review? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFeedback(deleteConfirm._id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">All Feedbacks & Reviews</h2>
            <p className="text-gray-600 mt-1">Total: {allFeedback.length} reviews</p>
          </div>
        </div>

        {allFeedback.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No reviews found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allFeedback.map((feedback) => (
              <div key={feedback._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= feedback.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-gray-800">{feedback.rating}/5</span>
                    </div>
                    <p className="font-semibold text-gray-800">
                      {getTutorName(feedback.tutorId)}
                    </p>
                    <p className="text-sm text-gray-600">
                      By: {feedback.studentName || 'Anonymous'} • {new Date(feedback.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(feedback)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                    title="Delete review"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-700 text-sm">{feedback.message || feedback.comment || 'No comment provided'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Tutor Ratings & Reviews</h2>
            <p className="text-gray-600">
              Browse ratings and feedback from students to find the perfect tutor
            </p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('summary')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  viewMode === 'summary'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Eye className="w-4 h-4" />
                Summary
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  viewMode === 'detailed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                Detailed ({allFeedback.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Show detailed view if admin selected it */}
      {isAdmin && viewMode === 'detailed' ? (
        <DetailedFeedbackView />
      ) : (
        <>
          {/* Summary View - Original */}
          {/* Filters */}
          <div className="card mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Filter className="w-4 h-4 inline mr-2" />
                  Filter by Subject
                </label>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="input"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>
                      {subject.charAt(0).toUpperCase() + subject.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <ChevronDown className="w-4 h-4 inline mr-2" />
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input"
                >
                  <option value="rating">Highest Rating</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          {filteredTutors.length > 0 ? (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Showing {filteredTutors.length} tutor{filteredTutors.length !== 1 ? 's' : ''}
              </p>
              {filteredTutors.map(tutor => (
                <TutorRatingCard key={tutor._id} tutor={tutor} />
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No tutors found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
