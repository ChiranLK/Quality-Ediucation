import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  Send, BookOpen, Globe, Tag, FileText, AlertCircle,
  CheckCircle2, Loader2, ChevronDown, X,
} from "lucide-react";
import customFetch from "../../utils/customfetch";
import HelpRequestVideo from "../../components/HelpRequestVideo";

// ─── Static data ────────────────────────────────────────────────
const CATEGORIES = [
  { value: "Mathematics",       label: "Mathematics",       color: "bg-indigo-100 text-indigo-700" },
  { value: "Science",    label: "Science",            color: "bg-emerald-100 text-emerald-700" },
  { value: "IT & Programming",         label: "IT & Programming",   color: "bg-blue-100 text-blue-700" },
  { value: "English",    label: "English",            color: "bg-yellow-100 text-yellow-700" },
  { value: "History",    label: "History",            color: "bg-orange-100 text-orange-700" },
  { value: "Geography",  label: "Geography",          color: "bg-teal-100 text-teal-700" },
  { value: "Physics",    label: "Physics",            color: "bg-purple-100 text-purple-700" },
  { value: "Chemistry",  label: "Chemistry",          color: "bg-rose-100 text-rose-700" },
  { value: "Other",      label: "Other",              color: "bg-gray-100 text-gray-700" },
];

const LANGUAGES = [
  { value: "English",  label: "English",    flag: "🇬🇧" },
  { value: "Sinhala",  label: "Sinhala",    flag: "🇱🇰" },
  { value: "Tamil",      label: "Tamil",      flag: "🇮🇳" },
  { value: "French",     label: "French",     flag: "🇫🇷" },
  { value: "German",     label: "German",     flag: "🇩🇪" },
  { value: "Spanish",    label: "Spanish",    flag: "🇪🇸" },
  { value: "Chinese",    label: "Chinese",    flag: "🇨🇳" },
  { value: "Arabic",     label: "Arabic",     flag: "🇸🇦" },
  { value: "Japanese",   label: "Japanese",   flag: "🇯🇵" },
];

// ─── Field wrapper ───────────────────────────────────────────────
function Field({ label, icon: Icon, required, error, children }) {
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

// ─── Custom select ────────────────────────────────────────────────
function CustomSelect({ value, onChange, options, placeholder, error }) {
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
                onClick={() => { onChange(opt.value); setOpen(false); }}
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

// ─── Character counter ────────────────────────────────────────────
function CharCount({ value, max }) {
  const pct = (value.length / max) * 100;
  const color = pct > 90 ? "text-red-500" : pct > 70 ? "text-yellow-500" : "text-gray-400";
  return (
    <span className={`text-xs ml-auto ${color}`}>
      {value.length}/{max}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────
const INITIAL = { title: "", message: "", category: "", language: "English" };
const TITLE_MAX = 50;
const MSG_MAX   = 1000;

export default function HelpRequest({ user }) {
  const [form, setForm]       = useState(INITIAL);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ── Validation ──────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.title.trim())            e.title    = "Title is required.";
    else if (form.title.length < 5)    e.title    = "Title must be at least 5 characters.";
    if (!form.message.trim())          e.message  = "Message is required.";
    else if (form.message.length < 20) e.message  = "Please describe your issue in at least 20 characters.";
    if (!form.category)                e.category = "Please select a category.";
    if (!form.language)                e.language = "Please select a language.";
    return e;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ── Submit ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      await customFetch.post("/messages", {
        title:    form.title.trim(),
        message:  form.message.trim(),
        category: form.category,
        language: form.language,
      });

      toast.success("Your request has been published to all tutors! 🎉");
      setForm(INITIAL);
      setErrors({});
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      const msg = err?.response?.data?.msg || "Failed to submit. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = CATEGORIES.find((c) => c.value === form.category);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: "12px", fontSize: "14px" } }} />

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ask for Help</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500">Your request will be visible to all available tutors</p>
          </div>
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

      {/* ── Success banner ── */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3.5 mb-6 text-sm font-medium"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            Request published! Tutors will respond soon.
            <button onClick={() => setSubmitted(false)} className="ml-auto text-green-500 hover:text-green-700">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Supporting Video ── */}
      <HelpRequestVideo />

      {/* ── Card form ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-7"
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

          {/* Title */}
          <Field label="Request Title" icon={FileText} required error={errors.title}>
            <div className="relative">
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                maxLength={TITLE_MAX}
                placeholder="e.g. I need help understanding integration by parts"
                className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800
                  focus:outline-none focus:ring-2 focus:border-transparent transition-all
                  ${errors.title ? "border-red-300 focus:ring-red-200" : "border-gray-200 dark:border-gray-700 focus:ring-indigo-200 hover:border-indigo-300"}`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CharCount value={form.title} max={TITLE_MAX} />
              </div>
            </div>
          </Field>

          {/* Category + Language (side by side) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Category" icon={Tag} required error={errors.category}>
              <CustomSelect
                value={form.category}
                onChange={(v) => handleChange("category", v)}
                options={CATEGORIES}
                placeholder="Select a subject"
                error={errors.category}
              />
            </Field>

            <Field label="Language" icon={Globe} required error={errors.language}>
              <CustomSelect
                value={form.language}
                onChange={(v) => handleChange("language", v)}
                options={LANGUAGES}
                placeholder="Select language"
                error={errors.language}
              />
            </Field>
          </div>

          {/* Category pill preview */}
          <AnimatePresence>
            {selectedCategory && (
              <motion.div
                key={selectedCategory.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 -mt-2"
              >
                <span className="text-xs text-gray-400">Selected topic:</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${selectedCategory.color}`}>
                  {selectedCategory.label}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Detailed message */}
          <Field label="Detailed Message" icon={FileText} required error={errors.message}>
            <div className="relative">
              <textarea
                value={form.message}
                onChange={(e) => handleChange("message", e.target.value)}
                maxLength={MSG_MAX}
                rows={5}
                placeholder="Describe your problem in detail so tutors can help you better…"
                className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 resize-none
                  focus:outline-none focus:ring-2 focus:border-transparent transition-all leading-relaxed
                  ${errors.message ? "border-red-300 focus:ring-red-200" : "border-gray-200 dark:border-gray-700 focus:ring-indigo-200 hover:border-indigo-300"}`}
              />
              <div className="absolute right-3 bottom-3">
                <CharCount value={form.message} max={MSG_MAX} />
              </div>
            </div>
          </Field>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.97 } : {}}
            className={`mt-1 w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold text-white
              transition-all shadow-md shadow-indigo-200
              ${loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing…
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Publish Help Request
              </>
            )}
          </motion.button>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 -mt-2">
            By submitting, you agree that your request will be publicly visible to all verified tutors on TutorConnect.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
