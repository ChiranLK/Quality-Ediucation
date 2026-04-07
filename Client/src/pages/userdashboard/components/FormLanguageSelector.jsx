import { motion } from "framer-motion";

const LANGUAGE_OPTIONS = [
  { value: "English", label: "English", flag: "🇬🇧" },
  { value: "Sinhala", label: "සිංහල", flag: "🇱🇰" },
  { value: "Tamil", label: "தமிழ்", flag: "🇮🇳" },
];

export default function FormLanguageSelector({ selectedLanguage, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {LANGUAGE_OPTIONS.map((lang) => (
        <motion.label
          key={lang.value}
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-1 cursor-pointer"
        >
          <input
            type="radio"
            name="form-language"
            value={lang.value}
            checked={selectedLanguage === lang.value}
            onChange={(e) => onChange(e.target.value)}
            className="w-4 h-4 cursor-pointer accent-indigo-600"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {lang.flag} {lang.label}
          </span>
        </motion.label>
      ))}
    </div>
  );
}
