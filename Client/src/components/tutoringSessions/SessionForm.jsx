import { X, AlertCircle } from 'lucide-react';

const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Sinhala', 'History', 'Geography', 'Science', 'ICT',
  'Economics', 'Business Studies', 'Art', 'Music', 'Other'
];


const SessionForm = ({ session, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    subject: '',
    manualSubject: '',
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
  const [showManualSubject, setShowManualSubject] = useState(false);


  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (session) {
      const isManual = session.subject && !SUBJECT_OPTIONS.map(s => s.toLowerCase()).includes(session.subject.toLowerCase());
      setFormData({
        subject: isManual ? 'other' : (session.subject || ''),
        manualSubject: isManual ? session.subject : '',
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
      setShowManualSubject(isManual);
    } else {
      setFormData({
        subject: '',
        manualSubject: '',
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
      setShowManualSubject(false);
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
      const finalData = {
        ...formData,
        subject: formData.subject === 'other' ? formData.manualSubject : formData.subject
      };
      await onSave(finalData);
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
      if (name === 'subject') {
        setShowManualSubject(value === 'other');
      }
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };


  if (!isOpen) return null;

  const handleBackgroundClick = (e) => {
    if (modalRef.current && e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={handleBackgroundClick}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-modal-in"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {session ? 'Edit Session' : 'Create New Session'}
          </h2>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm text-red-700 dark:text-red-300">
              <p className="font-semibold mb-2">Please fix the following errors:</p>
              <ul className="list-disc list-inside space-y-1">
                {Object.values(errors).map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-4 py-2.5 bg-white dark:bg-gray-800 border rounded-xl transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm disabled:opacity-50 ${
                errors.subject ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <option value="">Select Subject</option>
              {SUBJECT_OPTIONS.map(opt => (
                <option key={opt} value={opt.toLowerCase()}>{opt}</option>
              ))}
            </select>
            {errors.subject && <p className="text-[10px] font-bold text-red-500 uppercase mt-1.5">{errors.subject}</p>}
          </div>

          {showManualSubject && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Manual Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="manualSubject"
                value={formData.manualSubject}
                onChange={handleChange}
                placeholder="e.g., Quantum Physics"
                required
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm outline-none"
              />
            </div>
          )}


          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Description <span className="text-red-500">*</span> <span className="font-normal text-gray-400">({formData.description.length}/500)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              placeholder="Describe the session topic and objectives"
              rows="3"
              className={`w-full px-4 py-2.5 bg-white dark:bg-gray-800 border rounded-xl transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm disabled:opacity-50 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {errors.description && <p className="text-[10px] font-bold text-red-500 uppercase mt-1.5">{errors.description}</p>}
          </div>


          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="schedule.date"
              value={formData.schedule.date}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className={`w-full px-4 py-2.5 bg-white dark:bg-gray-800 border rounded-xl transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm disabled:opacity-50 ${
                errors.date ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {errors.date && <p className="text-[10px] font-bold text-red-500 uppercase mt-1.5">{errors.date}</p>}
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="schedule.startTime"
                value={formData.schedule.startTime}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className={`w-full px-4 py-2.5 bg-white dark:bg-gray-800 border rounded-xl transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm disabled:opacity-50 ${
                  errors.startTime ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {errors.startTime && <p className="text-[10px] font-bold text-red-500 uppercase mt-1.5">{errors.startTime}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="schedule.endTime"
                value={formData.schedule.endTime}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className={`w-full px-4 py-2.5 bg-white dark:bg-gray-800 border rounded-xl transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm disabled:opacity-50 ${
                  errors.endTime ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {errors.endTime && <p className="text-[10px] font-bold text-red-500 uppercase mt-1.5">{errors.endTime}</p>}
            </div>
          </div>


          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Max Participants (1-100) <span className="text-red-500">*</span>
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
              className={`w-full px-4 py-2.5 bg-white dark:bg-gray-800 border rounded-xl transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm disabled:opacity-50 ${
                errors.maxParticipants ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {errors.maxParticipants && <p className="text-[10px] font-bold text-red-500 uppercase mt-1.5">{errors.maxParticipants}</p>}
          </div>


          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Level
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm disabled:opacity-50"
            >
              <option value="">Select Level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>


          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700 mt-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
            >
              {isSubmitting ? 'Saving...' : session ? 'Update Session' : 'Create Session'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SessionForm;