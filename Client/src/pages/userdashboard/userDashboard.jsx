import { useState } from "react";
import { Home, BookOpen, HelpCircle, Settings } from "lucide-react";
import { Sidebar, DashboardNavbar } from "../../components/index.js";
import HelpRequest from "./helprequest.jsx";

// ── Static data ────────────────────────────────────────────────────────────────

const SIDEBAR_LINKS = [
  { icon: Home,       label: "Home"     },
  { icon: BookOpen,   label: "Sessions" },
  { icon: HelpCircle, label: "Ask Help" },
  { icon: Settings,   label: "Settings" },
];


// ── Component ──────────────────────────────────────────────────────────────────

export default function UserDashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("Ask Help");

  return (
    <div className="min-h-screen flex bg-[#f7f8fc] font-sans">

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

          {/* Ask Help view */}
          {activePage === "Ask Help" && (
            <div className="flex-1 overflow-y-auto">
              <HelpRequest user={user} />
            </div>
          )}

          {/* Placeholder for other pages */}
          {activePage !== "Ask Help" && (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              <p>{activePage} — coming soon</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}


