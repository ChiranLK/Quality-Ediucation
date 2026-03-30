import { BookOpen, Users, CalendarDays, LogOut, User, ArrowLeft } from "lucide-react";
import DarkModeToggle from "../../components/DarkModeToggle";
import SessionList from "./sessions/SessionList";
import SessionDetails from "./sessions/SessionDetails";
import { useState } from "react";

export default function TutorDashboard({ user, onLogout }) {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'sessions', 'session-details'
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const handleViewSessions = () => {
    setCurrentView('sessions');
  };

  const handleViewSessionDetails = (sessionId) => {
    setSelectedSessionId(sessionId);
    setCurrentView('session-details');
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
      case 'sessions':
        return (
          <SessionList
            tutorId={user.id}
            onViewDetails={handleViewSessionDetails}
          />
        );
      case 'session-details':
        return (
          <SessionDetails
            sessionId={selectedSessionId}
            onBack={handleBackToSessions}
          />
        );
      default:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
              onClick={handleViewSessions}
            >
              <div className="bg-emerald-50 dark:bg-emerald-900/40 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <CalendarDays className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">My Sessions</h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm">View upcoming and past sessions.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="bg-teal-50 dark:bg-teal-900/40 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">My Students</h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm">See students assigned to you.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="bg-indigo-50 dark:bg-indigo-900/40 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Study Materials</h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Upload and manage resources.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen ,bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Navbar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-800 dark:text-gray-100">TutorConnect</span>
          <span className="ml-2 text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full">Tutor</span>
        </div>
        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.name}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {currentView === 'dashboard' ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Welcome, {user.name} 🎓</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Manage your sessions and students from here.</p>
          </>
        ) : currentView === 'sessions' ? (
          <div className="mb-6">
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        ) : null}

        {renderContent()}
      </main>
    </div>
  );
}
