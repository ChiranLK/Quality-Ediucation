import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, TrendingUp, Save } from 'lucide-react';
import ProgressCard from './ProgressCard';
import customFetch from '../../utils/customfetch';

export default function StudentProgress({ tutorId }) {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    topic: '',
    completionPercent: 0,
    notes: '',
  });

  useEffect(() => {
    const fetchStudentProgress = async () => {
      try {
        setLoading(true);
        const { data } = await customFetch.get(`/progress/tutor/${tutorId}`);
        setProgress(data.progress || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load progress');
      } finally {
        setLoading(false);
      }
    };

    if (tutorId) {
      fetchStudentProgress();
    }
  }, [tutorId]);

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
      const { data } = await customFetch.post('/progress', {
        studentId,
        tutorId,
        topic: editForm.topic,
        completionPercent: editForm.completionPercent,
        notes: editForm.notes,
      });

      if (data) {
        setProgress(
          progress.map((p) => (p._id === progressId ? { ...p, ...editForm } : p))
        );
        setEditingId(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save progress');
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Students' Progress
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Track and update your students' learning</p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg px-4 py-2">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
            {progress.length} {progress.length === 1 ? 'Record' : 'Records'}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {progress.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No progress records yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Start tracking your students' progress</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {progress.map((prog) => (
            <div key={prog._id}>
              {editingId === prog._id ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-blue-500">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Update Progress
                  </h3>

                  <div className="space-y-3">
                    {/* Topic */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Topic
                      </label>
                      <input
                        type="text"
                        value={editForm.topic}
                        onChange={(e) =>
                          setEditForm({ ...editForm, topic: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Completion Percent */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Completion: {editForm.completionPercent}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editForm.completionPercent}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            completionPercent: parseInt(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={editForm.notes}
                        onChange={(e) =>
                          setEditForm({ ...editForm, notes: e.target.value })
                        }
                        maxLength={2000}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleSaveProgress(prog._id, prog.student._id)
                        }
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded flex items-center justify-center gap-2"
                      >
                        <Save size={16} />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => handleEditClick(prog)}
                  className="cursor-pointer"
                >
                  <ProgressCard
                    progress={prog}
                    showStudentInfo={true}
                  />
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-right">
                    Click to edit →
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
