import { motion } from "framer-motion";
import { Play, Volume2 } from "lucide-react";

export default function HelpRequestVideo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="w-full max-w-2xl mx-auto px-4 mb-8"
    >
      <div className="relative group">
        {/* Video container */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-lg bg-gray-900 aspect-video">
          {/* YouTube embed - replace VIDEO_ID with actual video ID */}
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"
            title="How to use Help Request on TutorConnect"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Video info below */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Volume2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              How to Make the Best Help Request
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
              Watch this short video to learn how to craft an effective help request that tutors can quickly understand and respond to.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
