import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, Trash2, Plus, X, Save } from 'lucide-react';
import ProgressCard from '../../../components/feedback/ProgressCard';
import customFetch from '../../../utils/customfetch';

export default function StudentProgressManager({ user }) {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editForm, setEditForm] = useState({ topic: '', completionPercent: 0, notes: '' });
  const [newForm, setNewForm] = useState({ studentId: '', topic: '', completionPercent: 0, notes: '' });
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchProgress();
    fetchStudents();
  }, [user]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const { data } = await customFetch.get(`/progress/tutor/${user?._id}`);
      setProgress(data.progress || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await customFetch.get('/tutoring-sessions');
      const uniqueStudents = [
        ...new Map(
          (data.sessions || [])
            .filter(s => String(s.tutorId?._id || s.tutorId) === String(user?._id))
            .map(s => [s.studentId?._id, s.studentId])
        ).values()
      ];
      setStudents(uniqueStudents);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const handleEditClick = (prog) => {
    setEditingId(prog._id);
    setEditForm({
      topic: prog.topic,
      completionPercent: prog.completionPercent,
      notes: prog.notes,
    });
  };

  const handleSaveProgress = async (progressId, studentId) => {
    try {
      await customFetch.post('/progress', {
        studentId,
        tutorId: user?._id,
        topic: editForm.topic,
        completionPercent: editForm.completionPercent,
        notes: editForm.notes,
      });

      setProgress(
        progress.map((p) => (p._id === progressId ? { ...p, ...editForm } : p))
      );
      setEditingId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save progress');
    }
  };

  const handleAddProgress = async () => {
    if (!newForm.studentId || !newForm.topic) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { data } = await customFetch.post('/progress', {
        studentId: newForm.studentId,
        tutorId: user?._id,
        topic: newForm.topic,
        completionPercent: newForm.completionPercent,
        notes: newForm.notes,
      });

      setProgress([...progress, data.progress]);
      setNewForm({ studentId: '', topic: '', completionPercent: 0, notes: '' });
      setShowAddForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add progress');
    }
  };

  const handleDeleteProgress = async (progressId) => {
    if (!window.confirm('Are you sure you want to delete this progress record?')) {
      return;
    }

    try {
      await customFetch.delete(`/progress/${progressId}`);
      setProgress(progress.filter(p => p._id !== progressId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete progress');
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Student Progress</h2>
          <p className="text-gray-600 dark:text-gray-400">Track and update your students' learning</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg px-4 py-2">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
              {progress.length} {progress.length === 1 ? 'Record' : 'Records'}
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Progress
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Add New Progress</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student</label>
              <select
                value={newForm.studentId}
                onChange={(e) => setNewForm({ ...newForm, studentId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a student...</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.fullName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topic</label>
              <input
                type="text"
                value={newForm.topic}
                onChange={(e) => setNewForm({ ...newForm, topic: e.target.value })}
                placeholder="e.g., Mathematics - Algebra"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Completion: {newForm.completionPercent}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={newForm.completionPercent}
                onChange={(e) => setNewForm({ ...newForm, completionPercent: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
              <textarea
                value={newForm.notes}
                onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProgress}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {progress.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">No progress records yet. Click "Add Progress" to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {progress.map((prog) => (
            <div key={prog._id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              {editingId === prog._id ? (
                <div className="p-6 space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Edit Progress</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topic</label>
                    <input
                      type="text"
                      value={editForm.topic}
                      onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Completion: {editForm.completionPercent}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editForm.completionPercent}
                      onChange={(e) => setEditForm({ ...editForm, completionPercent: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveProgress(prog._id, prog.studentId._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <ProgressCard progress={prog} />
                  <div className="flex gap-2 justify-end p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <button
                      onClick={() => handleEditClick(prog)}
                      className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProgress(prog._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
