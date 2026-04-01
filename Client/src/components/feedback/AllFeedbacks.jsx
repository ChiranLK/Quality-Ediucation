import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, MessageSquare, Filter, Plus, Edit2, Trash2, X } from 'lucide-react';
import FeedbackCard from './FeedbackCard';
import customFetch from '../../utils/customfetch';

export default function AllFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    tutorId: '',
    rating: 5,
    message: '',
  });
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);

  // Fetch all feedbacks
  useEffect(() => {
    fetchAllFeedbacks();
  }, []);

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

  // Fetch students and tutors for dropdowns
  useEffect(() => {
    const fetchUsersForForm = async () => {
      try {
        const { data: allUsers } = await customFetch.get('/auth/all-users');
        setStudents(allUsers.users.filter((u) => u.role === 'user'));
        setTutors(allUsers.users.filter((u) => u.role === 'tutor'));
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };
    fetchUsersForForm();
  }, []);

  const getFilteredFeedbacks = () => {
    let filtered = feedbacks;

    if (ratingFilter !== 'all') {
      filtered = filtered.filter((f) => f.rating === parseInt(ratingFilter));
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.studentName?.toLowerCase().includes(search) ||
          f.tutorName?.toLowerCase().includes(search) ||
          f.message?.toLowerCase().includes(search)
      );
    }

    return filtered;
  };

  const handleEditClick = (feedback) => {
    setEditingId(feedback._id);
    setFormData({
      studentId: feedback.student?._id || feedback.studentId || '',
      tutorId: feedback.tutor?._id || feedback.tutorId || '',
      rating: feedback.rating,
      message: feedback.message,
    });
    setShowCreateForm(false);
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({
      studentId: '',
      tutorId: '',
      rating: 5,
      message: '',
    });
    setShowCreateForm(true);
  };

  const handleSaveFeedback = async () => {
    try {
      // Only require student/tutor for creating new feedback
      if (!editingId && (!formData.studentId || !formData.tutorId)) {
        alert('Please select both student and tutor');
        return;
      }

      if (editingId) {
        // Update existing feedback - only send rating and message
        await customFetch.put(`/feedbacks/admin/${editingId}`, {
          rating: formData.rating,
          message: formData.message,
        });
        setFeedbacks(
          feedbacks.map((f) =>
            f._id === editingId
              ? { ...f, rating: formData.rating, message: formData.message }
              : f
          )
        );
        setEditingId(null);
      } else {
        // Create new feedback
        const { data } = await customFetch.post('/feedbacks/admin/create', {
          studentId: formData.studentId,
          tutorId: formData.tutorId,
          rating: formData.rating,
          message: formData.message,
        });
        setFeedbacks([data.feedback, ...feedbacks]);
        setShowCreateForm(false);
      }

      setFormData({ studentId: '', tutorId: '', rating: 5, message: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save feedback');
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      await customFetch.delete(`/feedbacks/${feedbackId}`);
      setFeedbacks(feedbacks.filter((f) => f._id !== feedbackId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete feedback');
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingId(null);
    setFormData({ studentId: '', tutorId: '', rating: 5, message: '' });
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
          <p className="text-gray-600 dark:text-gray-400">View and manage all system feedbacks</p>
        </div>
        <div className="space-y-1 text-right">
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            New Feedback
          </button>
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

      {/* Create/Edit Form */}
      {(showCreateForm || editingId) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingId ? 'Edit Feedback' : 'Create New Feedback'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {!editingId && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Student
                  </label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  >
                    <option value="">Select a student...</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.fullName || s.name} ({s.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Tutor
                  </label>
                  <select
                    value={formData.tutorId}
                    onChange={(e) => setFormData({ ...formData, tutorId: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  >
                    <option value="">Select a tutor...</option>
                    {tutors.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.fullName || t.name} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {editingId && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Submitted by Student
                  </label>
                  <div className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white">
                    {feedbacks.find((f) => f._id === editingId)?.student?.fullName ||
                      feedbacks.find((f) => f._id === editingId)?.student?.name ||
                      feedbacks.find((f) => f._id === editingId)?.studentName ||
                      'Unknown Student'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Submitted for Tutor
                  </label>
                  <div className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white">
                    {feedbacks.find((f) => f._id === editingId)?.tutor?.fullName ||
                      feedbacks.find((f) => f._id === editingId)?.tutor?.name ||
                      feedbacks.find((f) => f._id === editingId)?.tutorName ||
                      'Unknown Tutor'}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setFormData({ ...formData, rating: r })}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      formData.rating === r
                        ? 'bg-yellow-400 text-gray-900'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {r}★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Add feedback message..."
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveFeedback}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
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
            <div
              key={feedback._id}
              className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <FeedbackCard feedback={feedback} showStudent={true} />
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => handleEditClick(feedback)}
                  className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteFeedback(feedback._id)}
                  className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
