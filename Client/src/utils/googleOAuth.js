import customFetch from "./customfetch";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Get Google OAuth URL and redirect
export const redirectToGoogleOAuth = async (role = "user") => {
  try {
    const { data } = await customFetch.get("/google-oauth/auth-url", {
      params: { role },
    });
    
    if (data.url) {
      // Redirect to Google OAuth
      window.location.href = data.url;
    }
  } catch (error) {
    console.error("Error initiating Google OAuth:", error);
    throw error;
  }
};
