import { motion, AnimatePresence } from "framer-motion";
import { Send, FileText, Tag, Globe, Loader2 } from "lucide-react";
import Field from "./Field";
import CustomSelect from "./CustomSelect";
import CharCount from "./CharCount";
import { CATEGORIES, LANGUAGES, TITLE_MAX, MSG_MAX } from "./helpRequestConstants";

export default function HelpRequestForm({
  form,
  errors,
  loading,
  onFormChange,
  onSubmit,
}) {
  const selectedCategory = CATEGORIES.find((c) => c.value === form.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-7"
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        {/* Title */}
        <Field label="Request Title" icon={FileText} required error={errors.title}>
          <div className="relative">
            <input
              type="text"
              value={form.title}
              onChange={(e) => onFormChange("title", e.target.value)}
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
              onChange={(v) => onFormChange("category", v)}
              options={CATEGORIES}
              placeholder="Select a subject"
              error={errors.category}
            />
          </Field>

          <Field label="Language" icon={Globe} required error={errors.language}>
            <CustomSelect
              value={form.language}
              onChange={(v) => onFormChange("language", v)}
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
              onChange={(e) => onFormChange("message", e.target.value)}
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
  );
}
