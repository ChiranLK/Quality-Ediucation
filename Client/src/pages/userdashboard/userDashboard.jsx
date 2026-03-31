import { useState } from "react";
import { Home, BookOpen, HelpCircle, Settings, TrendingUp, MessageSquare } from "lucide-react";
import { Sidebar, DashboardNavbar } from "../../components/index.js";
import HelpRequest from "./helprequest.jsx";
import UserHome from "./userHome.jsx";
import { MyProgress, MyFeedbacks, SubmitFeedback } from "../../components/feedback/index.js";

// ── Static data ────────────────────────────────────────────────────────────────

const SIDEBAR_LINKS = [
  { icon: Home,           label: "Home"      },
  { icon: TrendingUp,     label: "Progress"  },
  { icon: MessageSquare,  label: "Feedbacks" },
  { icon: BookOpen,       label: "Sessions"  },
  { icon: HelpCircle,     label: "Ask Help"  },
  { icon: Settings,       label: "Settings"  },
];


// ── Component ──────────────────────────────────────────────────────────────────

export default function UserDashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("Home");
  const [feedbackTab, setFeedbackTab] = useState("received"); // 'received' or 'submit'

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
        <DashboardNavbar searchPlaceholder="Search messages…" />

        {/* ── Page content ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Home view */}
          {activePage === "Home" && (
            <UserHome user={user} onNavigate={setActivePage} />
          )}
          {/* Progress view */}
          {activePage === "Progress" && (
            <div className="flex-1 overflow-y-auto p-6">
              <MyProgress />
            </div>
          )}

          {/* Feedbacks view - with tabs */}
          {activePage === "Feedbacks" && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
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
              <HelpRequest user={user} />
            </div>
          )}

          {/* Placeholder for other pages */}
          {activePage !== "Ask Help" && activePage !== "Progress" && activePage !== "Feedbacks" && activePage !== "Home" && (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              <p>{activePage} — coming soon</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}


