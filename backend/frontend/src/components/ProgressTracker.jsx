import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Clock, CheckCircle, AlertCircle, Award, Calendar, Plus, X } from 'lucide-react';
import { progressAPI, authAPI, tutorsAPI } from '../services/api';

export default function ProgressTracker() {
  const [progress, setProgress] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('subject');
  const [tutors, setTutors] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    tutorId: '',
    topic: '',
    completionPercent: 50,
    notes: '',
  });
  const [stats, setStats] = useState({
    overallProgress: 0,
    activeSubjects: 0,
    completedTasks: 0,
    achievements: 0,
  });

  useEffect(() => {
    fetchData();
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const response = await tutorsAPI.getAllTutors();
      setTutors(response.data.tutors || []);
    } catch (error) {
      console.error('Failed to fetch tutors:', error);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch progress data
      const progressRes = await progressAPI.getProgress();
      const progressData = progressRes.data.progress || [];

      // Fetch user data from backend or localStorage
      const storedUserData = localStorage.getItem('userProfileData');
      const userData = storedUserData ? JSON.parse(storedUserData) : null;
      
      setUser(userData);
      setProgress(progressData);
      
      // Calculate stats from actual data
      if (progressData.length > 0) {
        const totalCompleted = progressData.reduce((sum, p) => sum + (p.completionPercent || 0), 0);
        const overallPercent = Math.round(totalCompleted / progressData.length);
        
        setStats({
          overallProgress: overallPercent,
          activeSubjects: progressData.length,
          completedTasks: progressData.filter(p => p.completionPercent === 100).length,
          achievements: Math.floor(overallPercent / 10),
        });
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Try fallback to fetch from authAPI if progressAPI fails
      try {
        const meRes = await authAPI.getMe();
        const userData = meRes.data;
        setUser(userData);
        localStorage.setItem('userProfileData', JSON.stringify(userData));
      } catch (authError) {
        console.error('Failed to fetch user data:', authError);
      }
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (completed, total) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const handleAddProgress = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (!formData.tutorId || !formData.topic.trim()) {
        alert('Please fill in all required fields');
        return;
      }

      const userData = JSON.parse(localStorage.getItem('userProfileData'));
      
      await progressAPI.createProgress({
        studentId: userData._id,
        tutorId: formData.tutorId,
        topic: formData.topic,
        completionPercent: parseInt(formData.completionPercent),
        notes: formData.notes,
      });

      // Reset form and refresh data
      setFormData({
        tutorId: '',
        topic: '',
        completionPercent: 50,
        notes: '',
      });
      setShowAddForm(false);
      await fetchData();
    } catch (error) {
      console.error('Failed to add progress:', error);
      alert('Failed to add progress. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'from-green-400 to-green-600';
    if (percentage >= 60) return 'from-blue-400 to-blue-600';
    if (percentage >= 40) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const getStatusBadge = (percentage) => {
    if (percentage >= 80) return 'badge-success';
    if (percentage >= 60) return 'badge-primary';
    if (percentage >= 40) return 'badge-warning';
    return 'badge-danger';
  };

  const ProgressCard = ({ title, percentage, topic, tutor, lastUpdated }) => {
    const isOnTrack = percentage >= 60;

    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-800">{title || topic || 'Progress'}</h3>
              {tutor?.fullName && (
                <p className="text-xs text-gray-600">with {tutor.fullName}</p>
              )}
            </div>
          </div>
          <span className={`badge ${getStatusBadge(percentage)}`}>
            {isOnTrack ? 'On Track' : 'Needs Work'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getProgressColor(
                percentage
              )} transition-all duration-500`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-bold text-blue-600">{percentage}%</p>
            <p className="text-xs text-gray-600">Completion</p>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">
              {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-xs text-gray-600">Last Updated</p>
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
          <p className="text-gray-600">Loading progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-800">Learning Progress</h2>
        </div>
        <p className="text-gray-600">
          Track your academic journey and learning milestones
        </p>
      </div>

      {/* User Info Card */}
      {user && (
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                  {user.fullName?.[0]}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {user.fullName}
                </h3>
                <p className="text-sm text-gray-600">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Member Since</p>
              <p className="text-sm font-semibold text-gray-800">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">Overall Progress</p>
          <p className="text-2xl font-bold text-gray-800">{stats.overallProgress}%</p>
        </div>
        <div className="card text-center">
          <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">Active Subjects</p>
          <p className="text-2xl font-bold text-gray-800">{stats.activeSubjects}</p>
        </div>
        <div className="card text-center">
          <CheckCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">Completed Tasks</p>
          <p className="text-2xl font-bold text-gray-800">{stats.completedTasks}</p>
        </div>
        <div className="card text-center">
          <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">Achievements</p>
          <p className="text-2xl font-bold text-gray-800">{stats.achievements}</p>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="mb-6 flex gap-2 justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('subject')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              chartType === 'subject'
                ? 'btn-primary'
                : 'btn-secondary'
            }`}
          >
            By Subject
          </button>
          <button
            onClick={() => setChartType('skill')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              chartType === 'skill'
                ? 'btn-primary'
                : 'btn-secondary'
            }`}
          >
            By Skill
          </button>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Progress
        </button>
      </div>

      {/* Add Progress Form */}
      {showAddForm && (
        <div className="card mb-8 bg-green-50 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Add New Progress</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 hover:bg-green-100 rounded transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleAddProgress} className="space-y-4">
            {/* Tutor Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Tutor *
              </label>
              <select
                value={formData.tutorId}
                onChange={(e) => setFormData(prev => ({ ...prev, tutorId: e.target.value }))}
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
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Topic/Subject *
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                placeholder="e.g., Calculus Chapter 5, SQL Basics..."
                className="input"
                required
              />
            </div>

            {/* Completion Percent */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Completion Level: {formData.completionPercent}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={formData.completionPercent}
                onChange={(e) => setFormData(prev => ({ ...prev, completionPercent: e.target.value }))}
                className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about your progress..."
                className="textarea"
                rows="3"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formLoading}
              className="btn-primary w-full"
            >
              {formLoading ? 'Saving...' : 'Save Progress'}
            </button>
          </form>
        </div>
      )}

      {/* Progress Cards - Dynamic from Database */}
      {chartType === 'subject' && (
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-gray-800">Progress by Topic</h3>
          {progress.length === 0 ? (
            <div className="card text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No progress data available</p>
              <p className="text-sm text-gray-500">Start completing tasks to see your progress</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {progress.map((item, idx) => (
                <ProgressCard
                  key={item._id || idx}
                  title={`${item.topic || 'Untitled'} - ${item.session ? 'Session' : 'Self Study'}`}
                  percentage={item.completionPercent || 0}
                  topic={item.topic}
                  tutor={item.tutor}
                  lastUpdated={item.updatedAt}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Progress Cards - By Skill */}
      {chartType === 'skill' && (
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-gray-800">Skill Mastery</h3>
          {progress.length === 0 ? (
            <div className="card text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No skill data available</p>
              <p className="text-sm text-gray-500">Complete more tasks to develop your skills</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {progress.map((item, idx) => (
                <ProgressCard
                  key={`skill-${item._id || idx}`}
                  title={`Mastering ${item.topic || 'Skills'}`}
                  percentage={item.completionPercent || 0}
                  topic={item.topic}
                  tutor={item.tutor}
                  lastUpdated={item.updatedAt}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Recent Progress
        </h3>
        {progress.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {progress.slice(0, 5).map((item, idx) => {
              const percentage = item.completionPercent || 0;
              const getIcon = (idx) => {
                const icons = [CheckCircle, Award, TrendingUp, Target, Clock];
                return icons[idx % icons.length];
              };
              const colors = ['green', 'purple', 'blue', 'yellow', 'indigo'];
              const color = colors[idx % colors.length];
              const IconComponent = getIcon(idx);

              return (
                <div key={item._id || idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full bg-${color}-100`}>
                    <IconComponent className={`w-5 h-5 text-${color}-600`} />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.topic || 'Progress Update'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.tutor?.fullName && `with ${item.tutor.fullName}`}
                        {item.tutor?.fullName && item.updatedAt ? ' • ' : ''}
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold ${
                      percentage >= 80 ? 'text-green-600' :
                      percentage >= 50 ? 'text-blue-600' : 
                      'text-yellow-600'
                    }`}>
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}