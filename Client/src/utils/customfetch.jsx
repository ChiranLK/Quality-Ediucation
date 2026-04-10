import axios from "axios";

const customFetch = axios.create({
    baseURL: "/api",
    withCredentials: true, // Include cookies with requests
});

// Interceptor to add Authorization header from sessionStorage/localStorage per request
// This ensures each tab uses its own auth token
customFetch.interceptors.request.use((config) => {
  // Check sessionStorage first (tab-specific), then localStorage (remember-me)
  const sessionToken = sessionStorage.getItem("token");
  const localToken = localStorage.getItem("token");
  const token = sessionToken || localToken;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle 401 Unauthorized globally (e.g., when a user is deleted by admin)
customFetch.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Force logout and redirect
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default customFetch;