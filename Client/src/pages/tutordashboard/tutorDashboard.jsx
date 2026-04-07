import { BookOpen, Users, CalendarDays, LogOut, User, ArrowLeft, Star, TrendingUp, MessageSquare } from "lucide-react";
import DarkModeToggle from "../../components/DarkModeToggle";
import SessionList from "./sessions/SessionList";
import SessionDetails from "./sessions/SessionDetails";
import { StudentProgress, TutorRatings, TutorFeedbacks } from "../../components/feedback/index.js";
import TutorHome from "./tutorHome";
import MySessions from "./components/MySessions";
import StudentProgressManager from "./components/StudentProgressManager";
import StudyMaterials from "./components/StudyMaterials";
import { useState, useEffect } from "react";

export default function TutorDashboard({ user, onLogout }) {
  const [currentView, setCurrentView] = useState(() => {
    return sessionStorage.getItem('tutorDashboardActiveView') || 'dashboard';
  });
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  useEffect(() => {
    sessionStorage.setItem('tutorDashboardActiveView', currentView);
  }, [currentView]);

  const handleViewSessions = () => {
    setCurrentView('sessions');
  };

  const handleViewProgress = () => {
    setCurrentView('progress');
  };

  const handleViewRatings = () => {
    setCurrentView('ratings');
  };

  const handleViewFeedbacks = () => {
    setCurrentView('feedbacks');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedSessionId(null);
  };

  const handleBackToSessions = () => {
    setCurrentView('sessions');
    setSelectedSessionId(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <TutorHome user={user} onNavigate={(view) => setCurrentView(view)} />
        );
      case 'My Sessions':
      case 'sessions':
        return <MySessions user={user} />;
      case 'Student Progress':
      case 'progress':
        return <StudentProgressManager user={user} />;
      case 'session-details':
        return (
          <SessionDetails
            sessionId={selectedSessionId}
            onBack={handleBackToSessions}
          />
        );
      case 'Your Ratings':
      case 'ratings':
        return <TutorRatings tutorId={user._id} />;
      case 'Feedbacks':
      case 'feedbacks':
        return <TutorFeedbacks tutorId={user._id} />;
      case 'Study Materials':
      case 'study-materials':
        return <StudyMaterials user={user} />;
      default:
        return (
          <TutorHome user={user} onNavigate={(view) => setCurrentView(view)} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Navbar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <button
          onClick={handleBackToDashboard}
          className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-75"
        >
          <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">Tutor<span className="text-indigo-600">Connect</span></span>
          <span className="ml-2 text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Tutor</span>
        </button>
        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{user.fullName || user.name}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-bold uppercase tracking-wide transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {currentView === 'dashboard' ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Welcome back, {user.fullName || user.name} 🎓</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Ready to inspire some students today?</p>
          </>
        ) : (
          <div className="mb-6">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-xs uppercase tracking-wider mb-4 transition-all hover:-translate-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </button>
          </div>
        )}

        {renderContent()}
      </main>
    </div>

  );
}
