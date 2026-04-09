import { useState, useEffect } from "react";
import { Home, BookOpen, HelpCircle, Settings, TrendingUp, MessageSquare, ArrowLeft } from "lucide-react";
import { Sidebar, DashboardNavbar } from "../../components/index.js";
import HelpRequest from "./helprequest.jsx";
import UserHome from "./userHome.jsx";
import { MyProgress, MyFeedbacks, SubmitFeedback } from "../../components/feedback/index.js";
import StudentMaterials from "./components/StudentMaterials.jsx";
import UserProfile from "./components/UserProfile.jsx";

// ── Static data ────────────────────────────────────────────────────────────────

const SIDEBAR_LINKS = [
  { icon: Home,           label: "Home"      },
  { icon: TrendingUp,     label: "Progress"  },
  { icon: MessageSquare,  label: "Feedbacks" },
  { icon: BookOpen,       label: "Materials" },
  { icon: BookOpen,       label: "Sessions"  },
  { icon: HelpCircle,     label: "Ask Help"  },
  { icon: Settings,       label: "Settings"  },
];


// ── Component ──────────────────────────────────────────────────────────────────

export default function UserDashboard({ user, onLogout, onUpdateUser }) {
  const [activePage, setActivePage] = useState(() => {
    return sessionStorage.getItem('userDashboardActivePage') || "Home";
  });
  const [feedbackTab, setFeedbackTab] = useState("received"); // 'received' or 'submit'

  useEffect(() => {
    sessionStorage.setItem('userDashboardActivePage', activePage);
  }, [activePage]);

  return (
    <div className="min-h-screen flex bg-[#f7f8fc] dark:bg-gray-950 font-sans">

      {/* ── Sidebar ── */}
      <Sidebar
        links={SIDEBAR_LINKS}
        activeLabel={activePage}
        onNavigate={setActivePage}
        user={user}
        onLogout={onLogout}
      />

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Top navbar ── */}
        <DashboardNavbar searchPlaceholder="Search messages…" user={user} />

        {/* ── Page content ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Home view */}
          {activePage === "Home" && (
            <UserHome user={user} onNavigate={setActivePage} />
          )}
          {/* Progress view */}
          {activePage === "Progress" && (
            <div className="flex-1 overflow-y-auto p-6">
              <button
                onClick={() => setActivePage("Home")}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </button>
              <MyProgress />
            </div>
          )}

          {/* Feedbacks view - with tabs */}
          {activePage === "Feedbacks" && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <button
                  onClick={() => setActivePage("Home")}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </button>
                {/* Tab buttons */}
                <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setFeedbackTab("submit")}
                    className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                      feedbackTab === "submit"
                        ? "border-blue-600 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                    }`}
                  >
                    Submit Feedback
                  </button>
                  <button
                    onClick={() => setFeedbackTab("received")}
                    className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                      feedbackTab === "received"
                        ? "border-blue-600 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                    }`}
                  >
                    My Feedbacks
                  </button>
                </div>

                {/* Tab content */}
                <div className="mt-6">
                  {feedbackTab === "submit" && (
                    <div className="max-w-2xl">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Give Feedback</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">Share your feedback and rate your tutors</p>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                        <SubmitFeedback />
                      </div>
                    </div>
                  )}

                  {feedbackTab === "received" && (
                    <MyFeedbacks />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ask Help view */}
          {activePage === "Ask Help" && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <button
                  onClick={() => setActivePage("Home")}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </button>
                <HelpRequest user={user} />
              </div>
            </div>
          )}

          {/* Materials View */}
          {activePage === "Materials" && (
            <div className="flex-1 overflow-y-auto p-6">
              <button
                onClick={() => setActivePage("Home")}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </button>
              <StudentMaterials />
            </div>
          )}

          {/* Settings View */}
          {activePage === "Settings" && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <button
                  onClick={() => setActivePage("Home")}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </button>
              </div>
              <UserProfile user={user} onUpdateUser={onUpdateUser} />
            </div>
          )}

          {/* Placeholder for other pages */}
          {activePage !== "Ask Help" && activePage !== "Progress" && activePage !== "Feedbacks" && activePage !== "Materials" && activePage !== "Settings" && activePage !== "Home" && (
            <div className="flex-1 overflow-y-auto p-6">
              <button
                onClick={() => setActivePage("Home")}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </button>
              <div className="flex items-center justify-center min-h-[60vh] text-gray-400 text-sm">
                <p>{activePage} — coming soon</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}


