import { motion } from "framer-motion";
import { Bell, Search, User } from "lucide-react";

/**
 * DashboardNavbar — sticky top header with search, bell and avatar.
 * @param {{ searchPlaceholder?: string, onSearch?: (q:string)=>void }} props
 */
export default function DashboardNavbar({ searchPlaceholder = "Search…", onSearch }) {
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-4 shadow-sm sticky top-0 z-10"
    >
      {/* ── Search bar ── */}
      <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2 max-w-sm">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch?.(e.target.value)}
          className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400"
        />
      </div>

      {/* ── Right actions ── */}
      <div className="ml-auto flex items-center gap-3">
        {/* Notification bell */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </motion.button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
          <User className="w-4 h-4 text-indigo-600" />
        </div>
      </div>
    </motion.header>
  );
}
