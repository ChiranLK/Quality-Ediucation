import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

export default function Field({ label, icon: Icon, required, error, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-1.5"
    >
      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
        <Icon className="w-3.5 h-3.5 text-indigo-400" />
        {label}
        {required && <span className="text-red-500 text-xs">*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            key="err"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1 text-xs text-red-500"
          >
            <AlertCircle className="w-3 h-3 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
