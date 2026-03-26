import { useState } from "react";
import "./App.css";
import LoginPage from "./pages/login.jsx";
import UserDashboard from "./pages/userdashboard/userDashboard.jsx";
import TutorDashboard from "./pages/tutordashboard/tutorDashboard.jsx";
import AdminDashboard from "./pages/admindashboard/adminDashboard.jsx";

const DASHBOARDS = {
  user: UserDashboard,
  tutor: TutorDashboard,
  admin: AdminDashboard,
};

export default function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogin = (data) => {
    setUser(data.user);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  if (user) {
    const Dashboard = DASHBOARDS[user.role];
    if (Dashboard) return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return <LoginPage onLogin={handleLogin} />;
}


