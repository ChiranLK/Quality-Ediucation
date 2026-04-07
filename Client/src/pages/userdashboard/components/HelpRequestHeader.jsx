import { motion } from "framer-motion";
import { BookOpen, Globe, Eye } from "lucide-react";

export default function HelpRequestHeader({ onViewSubmissions }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ask for Help</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500">Your request will be visible to all available tutors</p>
          </div>
        </div>

        {/* View Submitted Messages Button */}
        <motion.button
          onClick={onViewSubmissions}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors font-medium text-sm"
        >
          <Eye className="w-4 h-4" />
          <span>My Submissions</span>
        </motion.button>
      </div>

      {/* Public notice */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 mt-4"
      >
        <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
        <p className="text-xs text-indigo-700 font-medium">
          This is a <strong>public request</strong> — any tutor on TutorConnect can see and respond to it.
        </p>
      </motion.div>
    </motion.div>
  );
}
