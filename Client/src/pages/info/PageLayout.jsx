import { motion } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function PageLayout({ title, children, onBack }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 flex flex-col transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-transparent dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
              <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-400 dark:to-indigo-600">
                TutorConnect
              </span>
            </div>
            
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-8 border-l-4 border-indigo-600 pl-4">
              {title}
            </h1>
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 md:p-12 prose prose-slate dark:prose-invert max-w-none">
              {children}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Basic Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 py-8 border-t border-slate-800 dark:border-slate-800 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} TutorConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}
