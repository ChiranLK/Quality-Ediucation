import { useState, useEffect } from "react";
import "./App.css";
import LoginPage from "./pages/login.jsx";
import UserDashboard from "./pages/userdashboard/userDashboard.jsx";
import TutorDashboard from "./pages/tutordashboard/tutorDashboard.jsx";
import AdminDashboard from "./pages/admindashboard/adminDashboard.jsx";
import { DarkModeProvider } from "./context/DarkModeContext.jsx";
import SplashScreen from "./pages/homepage/SplashScreen.jsx";
import HomePage from "./pages/homepage/HomePage.jsx";

const DASHBOARDS = {
  user: UserDashboard,
  tutor: TutorDashboard,
  admin: AdminDashboard,
};

export default function App() {
  return (
    <DarkModeProvider>
      <AppContent />
    </DarkModeProvider>
  );
}

function AppContent() {
  const [currentView, setCurrentView] = useState("splash");
  const [user, setUser] = useState(() => {
    // Check sessionStorage first (tab-specific session), then localStorage (persistent remember-me)
    const sessionStored = sessionStorage.getItem("user");
    if (sessionStored) return JSON.parse(sessionStored);
    
    const persistedStored = localStorage.getItem("user");
    if (persistedStored) {
      // If found in localStorage (from 'remember me'), restore to sessionStorage for current tab
      const user = JSON.parse(persistedStored);
      const token = localStorage.getItem("token");
      if (token) sessionStorage.setItem("token", token);
      return user;
    }
    return null;
  });

  // If user is already logged in securely from session, skip splash/home and go straight to dashboard
  useEffect(() => {
    if (user && currentView !== "dashboard") {
      setCurrentView("dashboard");
    }
  }, [user, currentView]);

  const handleLogin = (data) => {
    setUser(data.user);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView("home"); // Redirect to home after logout
    // Clear session-specific auth data
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    // Also clear persistent auth data (if any)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  if (user) {
    const Dashboard = DASHBOARDS[user.role];
    if (Dashboard) return <Dashboard user={user} onLogout={handleLogout} />;
  }

  // Not logged in routing
  if (currentView === "splash") {
    return <SplashScreen onFinish={() => setCurrentView("home")} />;
  }
  
  if (currentView === "home") {
    return <HomePage onNavigateToLogin={() => setCurrentView("login")} />;
  }

  // Default fallback for unauthenticated users is Login Page
  return <LoginPage onLogin={handleLogin} />;
}
