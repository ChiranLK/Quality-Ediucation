import { BookOpen, Users, ShieldCheck, LogOut, User, BarChart2 } from "lucide-react";

export default function AdminDashboard({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-rose-600 p-2 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-800">TutorConnect</span>
          <span className="ml-2 text-xs bg-rose-100 text-rose-700 font-semibold px-2 py-0.5 rounded-full">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
              <User className="w-4 h-4 text-rose-600" />
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
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Panel 🛡️</h1>
        <p className="text-gray-500 text-sm mb-8">Manage users, tutors, and platform settings.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="bg-rose-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Manage Users</h3>
            <p className="text-gray-400 text-sm">View, edit and remove users.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="bg-orange-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Manage Tutors</h3>
            <p className="text-gray-400 text-sm">Verify and oversee tutor accounts.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="bg-yellow-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
              <BarChart2 className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Reports</h3>
            <p className="text-gray-400 text-sm">View platform analytics and stats.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
