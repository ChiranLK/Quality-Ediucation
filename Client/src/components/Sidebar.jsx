import { motion } from "framer-motion";
import { BookOpen, LogOut, User } from "lucide-react";

/**
 * Sidebar
 * @param {{ links: Array<{icon: React.ElementType, label: string}>, activeLabel: string, onNavigate: (label:string)=>void, user: {name:string, email:string}, onLogout: ()=>void }} props
 */
export default function Sidebar({ links, activeLabel, onNavigate, user, onLogout }) {
  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-20 lg:w-60 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col py-6 px-3 lg:px-5 gap-2 shadow-sm shrink-0"
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <motion.div
          whileHover={{ rotate: 10 }}
          className="bg-indigo-600 p-2 rounded-xl shrink-0"
        >
          <BookOpen className="w-5 h-5 text-white" />
        </motion.div>
        <span className="hidden lg:block text-base font-bold text-gray-800 dark:text-gray-100 tracking-tight">
          TutorConnect
        </span>
      </div>

      {/* ── Nav links ── */}
      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ icon: Icon, label }) => {
          const isActive = activeLabel === label;
          return (
            <motion.button
              key={label}
              whileHover={{ x: 3 }}
              onClick={() => onNavigate(label)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full text-left
                ${isActive
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:block">{label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeSidebarPill"
                  className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* ── User & logout ── */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="hidden lg:block overflow-hidden">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors font-medium"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="hidden lg:block">Logout</span>
        </motion.button>
      </div>
    </motion.aside>
  );
}
