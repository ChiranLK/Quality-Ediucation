import React, { useState, useEffect } from 'react';
import { Star, Heart, MessageCircle, TrendingUp } from 'lucide-react';
import { tutorsAPI } from '../services/api';

export default function RateTutor() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [tempRating, setTempRating] = useState(0);

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const response = await tutorsAPI.getAllTutors();
      setTutors(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRateClick = (tutor) => {
    setSelectedTutor(tutor);
    setTempRating(0);
  };

  const submitRating = async (rating) => {
    try {
      await tutorsAPI.updateTutorRating(selectedTutor._id, {
        rating,
        timestamp: new Date().toISOString(),
      });
      setSelectedTutor(null);
      fetchTutors();
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  };

  const TutorCard = ({ tutor }) => (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {tutor.avatar ? (
              <img
                src={tutor.avatar}
                alt={tutor.fullName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                {tutor.fullName?.[0]}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-800">{tutor.fullName}</h3>
              {tutor.tutorProfile?.subjects && (
                <p className="text-sm text-gray-600">
                  {tutor.tutorProfile.subjects.join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-lg text-gray-800">
              {(tutor.tutorProfile?.rating?.average || 0).toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {tutor.tutorProfile?.rating?.count || 0} ratings
          </p>
        </div>
      </div>

      {tutor.tutorProfile?.bio && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {tutor.tutorProfile.bio}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {tutor.tutorProfile?.subjects?.slice(0, 3).map(subject => (
          <span key={subject} className="badge badge-primary">
            {subject}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-gray-600">
        <div className="text-center p-2 bg-gray-50 rounded">
          <TrendingUp className="w-4 h-4 mx-auto mb-1 text-blue-600" />
          <p className="font-medium">{tutor.tutorProfile?.sessionCount || 0}</p>
          <p>Sessions</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <Heart className="w-4 h-4 mx-auto mb-1 text-red-600" />
          <p className="font-medium">{tutor.tutorProfile?.experience || 0}y</p>
          <p>Experience</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <MessageCircle className="w-4 h-4 mx-auto mb-1 text-green-600" />
          <p className="font-medium">
            {tutor.tutorProfile?.isVerified ? 'Yes' : 'No'}
          </p>
          <p>Verified</p>
        </div>
      </div>

      <button
        onClick={() => handleRateClick(tutor)}
        className="btn-primary w-full"
      >
        Rate This Tutor
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading tutors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Rate Your Tutor</h2>
        <p className="text-gray-600">Help other students find the best tutors by sharing your experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutors.map(tutor => (
          <TutorCard key={tutor._id} tutor={tutor} />
        ))}
      </div>

      {/* Rating Modal */}
      {selectedTutor && (
        <div className="modal-overlay" onClick={() => setSelectedTutor(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              {selectedTutor.avatar ? (
                <img
                  src={selectedTutor.avatar}
                  alt={selectedTutor.fullName}
                  className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {selectedTutor.fullName?.[0]}
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-800">
                {selectedTutor.fullName}
              </h3>
              <p className="text-sm text-gray-600">Rate your learning experience</p>
            </div>

            <div className="mb-6 text-center">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Your Rating:
              </p>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setTempRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoveredRating || tempRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {tempRating > 0 && (
              <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-sm font-medium text-blue-800">
                  You're giving {tempRating} out of 5 stars
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedTutor(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => submitRating(tempRating)}
                disabled={tempRating === 0}
                className="btn-primary flex-1"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
