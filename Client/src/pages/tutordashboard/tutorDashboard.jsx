import { BookOpen, Users, CalendarDays, LogOut, User } from "lucide-react";

export default function TutorDashboard({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-800">TutorConnect</span>
          <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">Tutor</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <User className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">{user.name}</span>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome, {user.name} 🎓</h1>
        <p className="text-gray-500 text-sm mb-8">Manage your sessions and students from here.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="bg-emerald-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
              <CalendarDays className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">My Sessions</h3>
            <p className="text-gray-400 text-sm">View upcoming and past sessions.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="bg-teal-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">My Students</h3>
            <p className="text-gray-400 text-sm">See students assigned to you.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="bg-indigo-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Study Materials</h3>
            <p className="text-gray-400 text-sm">Upload and manage resources.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
