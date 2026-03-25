import { useState } from "react";
import "./App.css";
import LoginPage from "./pages/userdashboard/login.jsx";

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (data) => {
    setUser(data.user);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {user.name} 👋
          </h1>
          <p className="text-gray-500 text-sm">Role: {user.role}</p>
          <button
            onClick={handleLogout}
            className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return <LoginPage onLogin={handleLogin} />;
}

