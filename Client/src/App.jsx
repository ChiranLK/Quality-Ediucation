import { useState } from "react";
import "./App.css";
import LoginPage from "./pages/login.jsx";
import UserDashboard from "./pages/userdashboard/userDashboard.jsx";
import TutorDashboard from "./pages/tutordashboard/tutorDashboard.jsx";
import AdminDashboard from "./pages/admindashboard/adminDashboard.jsx";
import { DarkModeProvider } from "./context/DarkModeContext.jsx";

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

  const handleLogin = (data) => {
    setUser(data.user);
  };

  const handleLogout = () => {
    setUser(null);
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

  return <LoginPage onLogin={handleLogin} />;
}
