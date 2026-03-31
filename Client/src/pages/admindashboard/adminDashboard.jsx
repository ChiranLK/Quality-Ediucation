import { BookOpen, Users, ShieldCheck, LogOut, User, BarChart2, MessageSquare, TrendingUp, ArrowLeft } from "lucide-react";
import DarkModeToggle from "../../components/DarkModeToggle";
import { AllFeedbacks, AdminProgress } from "../../components/feedback/index.js";
import { useState } from "react";

export default function AdminDashboard({ user, onLogout }) {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'feedbacks', 'progress'

  const handleViewFeedbacks = () => {
    setCurrentView('feedbacks');
  };

  const handleViewProgress = () => {
    setCurrentView('progress');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'feedbacks':
        return (
          <AllFeedbacks />
        );
      case 'progress':
        return (
          <AdminProgress />
        );
      default:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="bg-rose-50 dark:bg-rose-900/40 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Manage Users</h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm">View, edit and remove users.</p>
            </div>

            <div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="bg-orange-50 dark:bg-orange-900/40 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Manage Tutors</h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Verify and oversee tutor accounts.</p>
            </div>

            <div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
              onClick={handleViewFeedbacks}
            >
              <div className="bg-blue-50 dark:bg-blue-900/40 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">All Feedbacks</h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Monitor system feedbacks.</p>
            </div>

            <div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow"
              onClick={handleViewProgress}
            >
              <div className="bg-green-50 dark:bg-green-900/40 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Student Progress</h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm">View all student progress.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="bg-yellow-50 dark:bg-yellow-900/40 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <BarChart2 className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Reports</h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm">View platform analytics and stats.</p>
            </div>
          </div>
        );
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Navbar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-rose-600 p-2 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-800 dark:text-gray-100">TutorConnect</span>
          <span className="ml-2 text-xs bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 font-semibold px-2 py-0.5 rounded-full">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center">
              <User className="w-4 h-4 text-rose-600 dark:text-rose-400" />
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
      <main className="max-w-6xl mx-auto px-6 py-10">
        {currentView !== 'dashboard' && (
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        )}
        
        {currentView === 'dashboard' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Admin Panel 🛡️</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Manage users, tutors, and platform settings.</p>
          </>
        )}

        <div className={currentView === 'feedbacks' || currentView === 'progress' ? "bg-white dark:bg-gray-800 rounded-lg p-6" : ""}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
