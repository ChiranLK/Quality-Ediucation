import { useState } from "react";
import "./App.css";
import LoginPage from "./pages/login.jsx";
import UserDashboard from "./pages/userdashboard/userDashboard.jsx";
import TutorDashboard from "./pages/tutordashboard/tutorDashboard.jsx";
import AdminDashboard from "./pages/admindashboard/adminDashboard.jsx";
import { DarkModeProvider } from "./context/DarkModeContext.jsx";
import SplashScreen from "./pages/homepage/SplashScreen.jsx";
import HomePage from "./pages/homepage/HomePage.jsx";
import AboutUs from "./pages/info/AboutUs.jsx";
import PrivacyPolicy from "./pages/info/PrivacyPolicy.jsx";
import TermsOfService from "./pages/info/TermsOfService.jsx";
import RegisterPage from "./pages/register.jsx";
import AuthSuccessPage from "./pages/auth-success.jsx";
import AuthErrorPage from "./pages/auth-error.jsx";

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
  // Handle auth-success URL callback from backend
  const getInitialViewFromUrl = () => {
    const path = window.location.pathname;
    if (path.includes("auth-success")) return "auth-success";
    if (path.includes("auth-error")) return "auth-error";
    return null;
  };

  // Check if user is already logged in from storage FIRST
  const getInitialUser = () => {
    // First check for auth success with token in URL
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    const urlUser = params.get("user");
    
    if (urlToken && urlUser) {
      try {
        const user = JSON.parse(urlUser);
        sessionStorage.setItem("token", urlToken);
        sessionStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", urlToken);
        localStorage.setItem("user", JSON.stringify(user));
        return user;
      } catch (e) {
        console.error("Failed to parse user from URL:", e);
      }
    }

    // Then check storage
    const sessionStored = sessionStorage.getItem("user");
    if (sessionStored) return JSON.parse(sessionStored);
    
    const persistedStored = localStorage.getItem("user");
    if (persistedStored) {
      const user = JSON.parse(persistedStored);
      const token = localStorage.getItem("token");
      if (token) sessionStorage.setItem("token", token);
      return user;
    }
    return null;
  };

  const initialUser = getInitialUser();
  const urlView = getInitialViewFromUrl();
  
  // If on auth-success page, show it. Otherwise if user is logged in, show dashboard. Otherwise show splash
  const getInitialView = () => {
    if (urlView === "auth-success") return "auth-success";
    if (urlView === "auth-error") return "auth-error";
    if (initialUser) return "dashboard";
    return "splash";
  };
  
  const [currentView, setCurrentView] = useState(getInitialView());
  const [user, setUser] = useState(initialUser);

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

  const handleUpdateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    // Keep storage in sync so refreshes still work
    const stored = sessionStorage.getItem("user");
    if (stored) sessionStorage.setItem("user", JSON.stringify(merged));
    const local = localStorage.getItem("user");
    if (local) localStorage.setItem("user", JSON.stringify(merged));
  };

  if (user && currentView === "dashboard") {
    const Dashboard = DASHBOARDS[user.role];
    if (Dashboard) return <Dashboard user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />;
  }

  // Not logged in routing
  switch (currentView) {
    case "splash":
      return <SplashScreen onFinish={() => setCurrentView("home")} />;
    case "home":
      return <HomePage 
        onNavigate={(view) => setCurrentView(view)} 
        onNavigateToLogin={() => setCurrentView("login")} 
        onNavigateToRegister={() => setCurrentView("register")} 
      />;

    case "login":
      return <LoginPage onLogin={handleLogin} onBack={() => setCurrentView("home")} onNavigateToRegister={() => setCurrentView("register")} />;
    case "register":
      return <RegisterPage onLogin={handleLogin} onBack={() => setCurrentView("home")} onNavigateToLogin={() => setCurrentView("login")} />;
    case "about":
      return <AboutUs onBack={() => setCurrentView("home")} />;
    case "privacy":
      return <PrivacyPolicy onBack={() => setCurrentView("home")} />;
    case "terms":
      return <TermsOfService onBack={() => setCurrentView("home")} />;
    case "auth-success":
      return <AuthSuccessPage onLogin={handleLogin} onBack={() => setCurrentView("home")} />;
    case "auth-error":
      return <AuthErrorPage onBack={() => setCurrentView("login")} />;
    default:
      return <HomePage 
        onNavigate={(view) => setCurrentView(view)} 
        onNavigateToLogin={() => setCurrentView("login")} 
        onNavigateToRegister={() => setCurrentView("register")} 
      />;
  }
}
