import { 
  BookOpen, Users, ShieldCheck, LogOut, User, BarChart2, 
  MessageSquare, TrendingUp, ArrowLeft, Calendar, Star, 
  FileText, Activity, Settings, CheckCircle, AlertCircle, Clock 
} from "lucide-react";
import DarkModeToggle from "../../components/DarkModeToggle";
import { AllFeedbacks, AdminProgress } from "../../components/feedback/index.js";
import { useState } from "react";

/* ─── animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: "easeOut" },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: (i = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.4, delay: i * 0.07, ease: "easeOut" },
  }),
};

/* ─── static mock data ─── */
const STATS = [
  { label: "Total Users",    value: "1,284", delta: "+12%", icon: Users,     color: "rose" },
  { label: "Active Tutors",  value: "86",    delta: "+5%",  icon: BookOpen,  color: "orange" },
  { label: "Sessions Today", value: "34",    delta: "+8%",  icon: Calendar,  color: "yellow" },
  { label: "Avg. Rating",    value: "4.8",   delta: "+0.2", icon: Star,      color: "green" },
];

const ACTIVITY = [
  { id: 1, type: "user",    text: "New user registered: Kamal Perera",         time: "2 min ago",  status: "success" },
  { id: 2, type: "report",  text: "Tutor flagged for review: S. Fernando",      time: "15 min ago", status: "warning" },
  { id: 3, type: "session", text: "Session #204 completed successfully",        time: "32 min ago", status: "success" },
  { id: 4, type: "message", text: "New support message from a student",         time: "1 hr ago",   status: "info" },
  { id: 5, type: "report",  text: "Monthly report generated and ready to view", time: "2 hr ago",   status: "success" },
];

const QUICK_ACTIONS = [
  { label: "Add New Tutor",      icon: BookOpen,  color: "rose" },
  { label: "Generate Report",    icon: FileText,  color: "orange" },
  { label: "View Analytics",     icon: Activity,  color: "yellow" },
  { label: "Platform Settings",  icon: Settings,  color: "violet" },
];

const COLOR_MAP = {
  rose:   { bg: "bg-rose-50   dark:bg-rose-900/40",   icon: "text-rose-600   dark:text-rose-400",   badge: "bg-rose-100   dark:bg-rose-900   text-rose-700   dark:text-rose-300"   },
  orange: { bg: "bg-orange-50 dark:bg-orange-900/40", icon: "text-orange-600 dark:text-orange-400", badge: "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300" },
  yellow: { bg: "bg-yellow-50 dark:bg-yellow-900/40", icon: "text-yellow-600 dark:text-yellow-400", badge: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300" },
  green:  { bg: "bg-green-50  dark:bg-green-900/40",  icon: "text-green-600  dark:text-green-400",  badge: "bg-green-100  dark:bg-green-900  text-green-700  dark:text-green-300"  },
  violet: { bg: "bg-violet-50 dark:bg-violet-900/40", icon: "text-violet-600 dark:text-violet-400", badge: "bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300" },
};

const STATUS_ICON = {
  success: <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />,
  warning: <AlertCircle  className="w-4 h-4 text-yellow-500 shrink-0" />,
  info:    <Clock        className="w-4 h-4 text-blue-400 shrink-0" />,
};

/* ─── component ─── */
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
    <motion.div
      variants={fadeIn} initial="hidden" animate="show"
      className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
    >
      {/* ── Navbar ── */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="bg-rose-600 p-2 rounded-lg"
          >
            <ShieldCheck className="w-5 h-5 text-white" />
          </motion.div>
          <span className="text-lg font-bold text-gray-800 dark:text-gray-100">TutorConnect</span>
          <span className="ml-2 text-xs bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 font-semibold px-2 py-0.5 rounded-full">
            Admin
          </span>
        </div>

        {/* Search bar */}
        <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 w-64">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users, tutors…"
            className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-4">
          <DarkModeToggle />

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={() => setNotifOpen((p) => !p)}
              className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            </motion.button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-30"
                >
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Notifications</span>
                    <span className="text-xs text-rose-600 dark:text-rose-400 font-medium cursor-pointer">Mark all read</span>
                  </div>
                  {ACTIVITY.slice(0, 4).map((a) => (
                    <div key={a.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                      {STATUS_ICON[a.status]}
                      <div>
                        <p className="text-xs text-gray-700 dark:text-gray-300">{a.text}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center">
              <User className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
              {user?.name ?? "Admin"}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
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
    </motion.div>
  );
}
