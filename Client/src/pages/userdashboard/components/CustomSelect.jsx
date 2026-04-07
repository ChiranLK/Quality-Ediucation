import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function CustomSelect({ value, onChange, options, placeholder, error }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm bg-white dark:bg-gray-800 transition-all
          ${error ? "border-red-300 focus:ring-red-300" : "border-gray-200 dark:border-gray-700 focus:ring-indigo-200"}
          focus:outline-none focus:ring-2 focus:border-transparent hover:border-indigo-300`}
      >
        <span className={selected ? "text-gray-800 dark:text-gray-100 font-medium" : "text-gray-400 dark:text-gray-500"}>
          {selected ? (
            <span className="flex items-center gap-2">
              {selected.flag && <span>{selected.flag}</span>}
              {selected.label}
            </span>
          ) : placeholder}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-1.5 w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto"
          >
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm cursor-pointer transition-colors
                  ${value === opt.value ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
              >
                {opt.flag && <span className="text-base">{opt.flag}</span>}
                {opt.color
                  ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${opt.color}`}>{opt.label}</span>
                  : opt.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
