// src/components/tutoringSessions/SessionForm.jsx
import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

const SessionForm = ({ session, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    schedule: {
      date: '',
      startTime: '',
      endTime: '',
    },
    capacity: {
      maxParticipants: 10,
    },
    level: '',
    tags: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session) {
      setFormData({ // eslint-disable-line react-hooks/set-state-in-effect
        subject: session.subject || '',
        description: session.description || '',
        schedule: {
          date: session.schedule?.date ? new Date(session.schedule.date).toISOString().split('T')[0] : '',
          startTime: session.schedule?.startTime || '',
          endTime: session.schedule?.endTime || '',
        },
        capacity: {
          maxParticipants: session.capacity?.maxParticipants || 10,
        },
        level: session.level || '',
        tags: session.tags || [],
      });
    } else {
      setFormData({
        subject: '',
        description: '',
        schedule: {
          date: '',
          startTime: '',
          endTime: '',
        },
        capacity: {
          maxParticipants: 10,
        },
        level: '',
        tags: [],
      });
    }
    setErrors({});
  }, [session, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }
    
    if (!formData.schedule.date) {
      newErrors.date = 'Date is required';
    } else if (new Date(formData.schedule.date) < new Date()) {
      newErrors.date = 'Session date must be in the future';
    }
    
    if (!formData.schedule.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    
    if (!formData.schedule.endTime) {
      newErrors.endTime = 'End time is required';
    }
    
    if (formData.schedule.startTime && formData.schedule.endTime) {
      if (formData.schedule.startTime >= formData.schedule.endTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }
    
    if (formData.capacity.maxParticipants < 1 || formData.capacity.maxParticipants > 100) {
      newErrors.maxParticipants = 'Capacity must be between 1 and 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('schedule.')) {
      const fieldName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          [fieldName]: value,
        },
      }));
    } else if (name.startsWith('capacity.')) {
      const fieldName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        capacity: {
          ...prev.capacity,
          [fieldName]: fieldName === 'maxParticipants' ? parseInt(value) || 0 : value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {session ? 'Edit Session' : 'Create New Session'}
          </h2>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm text-red-700 dark:text-red-300">
              <p className="font-medium mb-1">Please fix the following errors:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {Object.values(errors).map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              placeholder="e.g., Mathematics, Physics, English"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.subject
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.subject && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.subject}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description * <span className="text-xs text-gray-500">({formData.description.length}/500)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              placeholder="Describe the session topic and objectives (10-500 characters)"
              rows="3"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.description
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.description && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              name="schedule.date"
              value={formData.schedule.date}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.date
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.date && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.date}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                name="schedule.startTime"
                value={formData.schedule.startTime}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.startTime
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.startTime && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.startTime}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Time *
              </label>
              <input
                type="time"
                name="schedule.endTime"
                value={formData.schedule.endTime}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.endTime
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.endTime && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.endTime}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max Participants (1-100) *
            </label>
            <input
              type="number"
              name="capacity.maxParticipants"
              value={formData.capacity.maxParticipants}
              onChange={handleChange}
              min="1"
              max="100"
              required
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.maxParticipants
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.maxParticipants && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.maxParticipants}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Level
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Saving...' : session ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionForm;