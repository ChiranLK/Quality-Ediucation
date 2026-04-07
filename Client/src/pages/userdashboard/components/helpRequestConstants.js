// Categories for help requests
export const CATEGORIES = [
  { value: "Mathematics", label: "Mathematics", color: "bg-indigo-100 text-indigo-700" },
  { value: "Science", label: "Science", color: "bg-emerald-100 text-emerald-700" },
  { value: "IT & Programming", label: "IT & Programming", color: "bg-blue-100 text-blue-700" },
  { value: "English", label: "English", color: "bg-yellow-100 text-yellow-700" },
  { value: "History", label: "History", color: "bg-orange-100 text-orange-700" },
  { value: "Geography", label: "Geography", color: "bg-teal-100 text-teal-700" },
  { value: "Physics", label: "Physics", color: "bg-purple-100 text-purple-700" },
  { value: "Chemistry", label: "Chemistry", color: "bg-rose-100 text-rose-700" },
  { value: "Other", label: "Other", color: "bg-gray-100 text-gray-700" },
];

// Supported languages
export const LANGUAGES = [
  { value: "English", label: "English", flag: "🇬🇧" },
  { value: "Sinhala", label: "Sinhala", flag: "🇱🇰" },
  { value: "Tamil", label: "Tamil", flag: "🇮🇳" },
  { value: "French", label: "French", flag: "🇫🇷" },
  { value: "German", label: "German", flag: "🇩🇪" },
  { value: "Spanish", label: "Spanish", flag: "🇪🇸" },
  { value: "Chinese", label: "Chinese", flag: "🇨🇳" },
  { value: "Arabic", label: "Arabic", flag: "🇸🇦" },
  { value: "Japanese", label: "Japanese", flag: "🇯🇵" },
];

// Initial form state
export const INITIAL_FORM = {
  title: "",
  message: "",
  category: "",
  language: "English",
};

// Character limits
export const TITLE_MAX = 50;
export const MSG_MAX = 1000;
