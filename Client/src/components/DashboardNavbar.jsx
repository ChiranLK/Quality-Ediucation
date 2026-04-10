import { motion } from "framer-motion";
import { Bell, Search } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";

/**
 * DashboardNavbar — sticky top header with search, bell and user avatar.
 * @param {{ searchPlaceholder?: string, onSearch?: (q:string)=>void, user?: object }} props
 */
export default function DashboardNavbar({ searchPlaceholder = "Search…", onSearch, user }) {

  /** Resolve avatar URL — real photo or initials fallback */
  const avatarSrc = (() => {
    if (user?.avatar && user.avatar !== "uploads/default-avatar.png") {
      return `http://localhost:5000/${user.avatar}`;
    }
    const name = user?.fullName || user?.name || "U";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff&size=64`;
  })();

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-3.5 flex items-center gap-4 shadow-sm sticky top-0 z-10"
    >
      {/* ── Search bar ── */}
      <div className="flex-1 flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2 max-w-sm">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch?.(e.target.value)}
          className="bg-transparent text-sm text-gray-700 dark:text-gray-200 outline-none w-full placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {/* ── Right actions ── */}
      <div className="ml-auto flex items-center gap-3">
        {/* Dark mode toggle */}
        <DarkModeToggle />

        {/* Notification bell */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="relative p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </motion.button>

        {/* Real user avatar */}
        <img
          src={avatarSrc}
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover bg-indigo-100 ring-2 ring-indigo-100 dark:ring-indigo-900"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "U")}&background=4F46E5&color=fff&size=64`;
          }}
        />
      </div>
    </motion.header>
  );
}
