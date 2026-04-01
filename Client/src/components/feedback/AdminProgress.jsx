import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, TrendingUp, Plus, Edit2, Trash2 } from 'lucide-react';
import ProgressCard from './ProgressCard';
import customFetch from '../../utils/customfetch';

export default function AdminProgress() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [tutorSearch, setTutorSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showTutorDropdown, setShowTutorDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    tutorId: '',
    tutorName: '',
    topic: '',
    completionPercent: 0,
    notes: '',
  });

  useEffect(() => {
    const fetchAllProgress = async () => {
      try {
        setLoading(true);
        const { data } = await customFetch.get('/progress/admin/all');
        setProgress(data.progress || []);
      } catch (err) {
        if (err.response?.status === 404) {
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

  // Fetch students and tutors for dropdowns
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await customFetch.get('/auth/all-users');
        setStudents(data.users.filter(u => u.role === 'user') || []);
        setTutors(data.users.filter(u => u.role === 'tutor') || []);
      } catch (err) {
        console.log('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteProgress = async (progressId) => {
    if (!window.confirm('Are you sure you want to delete this progress record?')) return;

    try {
      await customFetch.delete(`/progress/${progressId}`);
      setProgress(progress.filter(p => p._id !== progressId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete progress');
    }
  };

  const handleEditClick = (prog) => {
    // Extract student info - from populated object
    const studentId = prog.student?._id || prog.studentId;
    const studentName = prog.student?.fullName || prog.student?.name || prog.student?.email || 'Unknown';

    // Extract tutor info - from populated object
    const tutorId = prog.tutor?._id || prog.tutorId;
    const tutorName = prog.tutor?.fullName || prog.tutor?.name || prog.tutor?.email || 'Unknown';

    setIsEditing(true);
    setEditingId(prog._id);
    setFormData({
      studentId: studentId,
      studentName: studentName,
      tutorId: tutorId,
      tutorName: tutorName,
      topic: prog.topic,
      completionPercent: prog.completionPercent,
      notes: prog.notes || '',
    });
    setShowForm(true);
  };

  const handleSaveProgress = async () => {
    if (!isEditing && (!formData.studentId || !formData.tutorId)) {
      alert('Please select both student and tutor');
      return;
    }

    try {
      const payload = {
        studentId: formData.studentId,
        tutorId: formData.tutorId,
        topic: formData.topic,
        completionPercent: formData.completionPercent,
        notes: formData.notes,
      };

      let response;
      if (isEditing) {
        payload._id = editingId;
        response = await customFetch.post('/progress', payload);
      } else {
        response = await customFetch.post('/progress', payload);
      }

      // Update the list
      if (isEditing) {
        setProgress(
          progress.map(p => p._id === editingId ? response.data.progress : p)
        );
      } else {
        setProgress([...progress, response.data.progress]);
      }

      // Reset form
      setShowForm(false);
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        studentId: '',
        studentName: '',
        tutorId: '',
        tutorName: '',
        topic: '',
        completionPercent: 0,
        notes: '',
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save progress');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      studentId: '',
      studentName: '',
      tutorId: '',
      tutorName: '',
      topic: '',
      completionPercent: 0,
      notes: '',
    });
    setStudentSearch('');
    setTutorSearch('');
  };

  const filteredStudents = students.filter(s =>
    ((s.fullName || s.name)?.toLowerCase?.() || '').includes(studentSearch.toLowerCase()) ||
    (s.email?.toLowerCase?.() || '').includes(studentSearch.toLowerCase())
  );

  const filteredTutors = tutors.filter(t =>
    ((t.fullName || t.name)?.toLowerCase?.() || '').includes(tutorSearch.toLowerCase()) ||
    (t.email?.toLowerCase?.() || '').includes(tutorSearch.toLowerCase())
  );

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
        <div className="flex items-end gap-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            <Plus size={20} />
            New Progress
          </button>
          <div className="space-y-1 text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Average</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {progress.length > 0
                ? Math.round(progress.reduce((sum, p) => sum + p.completionPercent, 0) / progress.length)
                : 0}
              %
            </p>
            <p className="text-xs text-gray-500">{progress.length} Records</p>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
            {isEditing ? 'Edit Progress' : 'Add New Progress'}
          </h3>

          {/* Student Selection */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Student {isEditing && <span className="text-gray-500">(Read-only)</span>}
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.studentName}
                disabled
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  onClick={() => setShowStudentDropdown(true)}
                  placeholder="Select a student..."
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {showStudentDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredStudents.map(student => (
                      <button
                        key={student._id}
                        onClick={() => {
                          setFormData({ ...formData, studentId: student._id, studentName: student.fullName || student.name });
                          setStudentSearch('');
                          setShowStudentDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-900 dark:text-white"
                      >
                        {student.fullName || student.name} ({student.email})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tutor Selection */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tutor {isEditing && <span className="text-gray-500">(Read-only)</span>}
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.tutorName}
                disabled
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={tutorSearch}
                  onChange={(e) => setTutorSearch(e.target.value)}
                  onClick={() => setShowTutorDropdown(true)}
                  placeholder="Select a tutor..."
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {showTutorDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredTutors.map(tutor => (
                      <button
                        key={tutor._id}
                        onClick={() => {
                          setFormData({ ...formData, tutorId: tutor._id, tutorName: tutor.fullName || tutor.name });
                          setTutorSearch('');
                          setShowTutorDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-900 dark:text-white"
                      >
                        {tutor.fullName || tutor.name} ({tutor.email})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Topic */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Topic
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g., Mathematics - Algebra"
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Completion Percentage */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Completion: {formData.completionPercent}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.completionPercent}
              onChange={(e) => setFormData({ ...formData, completionPercent: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes..."
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancelForm}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProgress}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              {isEditing ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      )}

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
            <div key={prog._id} className="relative">
              <ProgressCard
                progress={prog}
                showTutorInfo={true}
                showStudentInfo={true}
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => handleEditClick(prog)}
                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteProgress(prog._id)}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                  title="Delete"
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
