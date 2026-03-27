import { Sun, Moon } from "lucide-react";
import { useDarkMode } from "../context/DarkModeContext";

/**
 * DarkModeToggle — radio-button style Light / Dark switcher.
 */
export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 gap-0.5"
    >
      {/* Light option */}
      <button
        role="radio"
        aria-checked={!darkMode}
        onClick={() => darkMode && toggleDarkMode()}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
          ${!darkMode
            ? "bg-white text-gray-800 shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
      >
        <Sun className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Light</span>
      </button>

      {/* Dark option */}
      <button
        role="radio"
        aria-checked={darkMode}
        onClick={() => !darkMode && toggleDarkMode()}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
          ${darkMode
            ? "bg-gray-700 text-white shadow-sm"
            : "text-gray-500 hover:text-gray-700"
          }`}
      >
        <Moon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Dark</span>
      </button>
    </div>
  );
}
