import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  // Priority: adminAuthToken (protected admin) > tutorAuthToken (protected tutor) > userAuthToken (student)
  // This ensures we use the role-specific token that was most recently set
  const adminToken = localStorage.getItem('adminAuthToken');
  const tutorToken = sessionStorage.getItem('tutorAuthToken');
  const userToken = localStorage.getItem('userAuthToken');
  
  // Use admin token if available, then tutor (from sessionStorage), then user
  const token = adminToken || tutorToken || userToken;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    const selectedSource = adminToken ? 'adminAuthToken (localStorage)' : 
                          tutorToken ? 'tutorAuthToken (sessionStorage)' : 
                          'userAuthToken (localStorage)';
    console.log('[API Interceptor] Token added to request:', {
      url: config.url,
      source: selectedSource,
      tokenPreview: token.substring(0, 20) + '...'
    });
  } else {
    console.log('[API Interceptor] No token found for request:', config.url);
  }
  return config;
});

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log('[API] Response received:', {
      url: response.config.url,
      status: response.status,
      dataKeys: Object.keys(response.data)
    });
    return response;
  },
  (error) => {
    console.error('[API] Error response:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Feedback API
export const feedbackAPI = {
  submitFeedback: (feedbackData) =>
    apiClient.post('/feedbacks', feedbackData),
  
  getFeedback: (id) =>
    apiClient.get(`/feedbacks/${id}`),
  
  getAllFeedbacks: () =>
    apiClient.get('/feedbacks'),
  
  updateFeedback: (id, feedbackData) =>
    apiClient.put(`/feedbacks/${id}`, feedbackData),
  
  deleteFeedback: (id) =>
    apiClient.delete(`/feedbacks/${id}`),
};

// Tutors API
export const tutorsAPI = {
  getAllTutors: () =>
    apiClient.get('/tutors'),
  
  getTutorById: (id) =>
    apiClient.get(`/tutors/${id}`),
  
  getTutorStudents: (tutorId) =>
    apiClient.get(`/tutors/${tutorId}/my-students`),
  
  updateTutorRating: (id, ratingData) =>
    apiClient.put(`/tutors/${id}/rating`, ratingData),
  
  getTutorRatings: (id) =>
    apiClient.get(`/tutors/${id}/ratings`),
};

// Progress API
export const progressAPI = {
  getProgress: () =>
    apiClient.get('/progress/me'),
  
  getProgressById: (id) =>
    apiClient.get(`/progress/${id}`),
  
  getProgressByStudent: (studentId) =>
    apiClient.get(`/progress/student/${studentId}`),
  
  getProgressByTutor: (tutorId) =>
    apiClient.get(`/progress/tutor/${tutorId}`),
  
  updateProgress: (id, progressData) =>
    apiClient.put(`/progress/${id}`, progressData),
  
  createProgress: (progressData) =>
    apiClient.post('/progress', progressData),
};

// Auth API
export const authAPI = {
  getMe: () =>
    apiClient.get('/auth/me'),
  
  getAllUsers: (params) =>
    apiClient.get('/auth/all-users', { params }),
};

export default apiClient;
