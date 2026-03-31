// API Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Tutor Availability Status
export const AVAILABILITY_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  OFFLINE: 'offline',
};

// Feedback Categories
export const FEEDBACK_CATEGORIES = {
  TEACHING: 'teaching',
  COMMUNICATION: 'communication',
  PROFESSIONALISM: 'professionalism',
  PATIENCE: 'patience',
};

// Rating Thresholds
export const RATING_THRESHOLDS = {
  EXCELLENT: 4.5,
  GOOD: 4.0,
  AVERAGE: 3.0,
  POOR: 2.0,
};

// Progress Status Colors
export const PROGRESS_COLORS = {
  EXCELLENT: 'from-green-400 to-green-600',
  GOOD: 'from-blue-400 to-blue-600',
  AVERAGE: 'from-yellow-400 to-yellow-600',
  POOR: 'from-red-400 to-red-600',
};

// Badge Types
export const BADGE_TYPES = {
  PRIMARY: 'badge-primary',
  SUCCESS: 'badge-success',
  WARNING: 'badge-warning',
  DANGER: 'badge-danger',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  PREFERENCES: 'preferences',
};

// API Endpoints
export const API_ENDPOINTS = {
  FEEDBACK: {
    LIST: '/feedbacks',
    CREATE: '/feedbacks',
    GET: (id) => `/feedbacks/${id}`,
    UPDATE: (id) => `/feedbacks/${id}`,
    DELETE: (id) => `/feedbacks/${id}`,
  },
  TUTORS: {
    LIST: '/tutors',
    GET: (id) => `/tutors/${id}`,
    RATINGS: (id) => `/tutors/${id}/ratings`,
    UPDATE_RATING: (id) => `/tutors/${id}/rating`,
  },
  PROGRESS: {
    LIST: '/progress',
    CREATE: '/progress',
    GET: (id) => `/progress/${id}`,
    UPDATE: (id) => `/progress/${id}`,
  },
  AUTH: {
    ME: '/auth/me',
  },
};

// Validation Rules
export const VALIDATION = {
  COMMENT_MIN_LENGTH: 10,
  COMMENT_MAX_LENGTH: 500,
  TUTOR_BIO_MAX_LENGTH: 500,
  SUBJECT_MAX_LENGTH: 50,
};

// UI Messages
export const MESSAGES = {
  SUCCESS: {
    FEEDBACK_SUBMITTED: 'Thank you! Your feedback has been submitted successfully.',
    RATING_SUBMITTED: 'Rating submitted successfully!',
    PROGRESS_UPDATED: 'Progress updated successfully!',
  },
  ERROR: {
    FEEDBACK_FAILED: 'Failed to submit feedback. Please try again.',
    RATING_FAILED: 'Failed to submit rating. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Please log in to continue.',
  },
};
