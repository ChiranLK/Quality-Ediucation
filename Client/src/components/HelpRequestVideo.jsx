import { motion } from "framer-motion";
import { Play, Volume2 } from "lucide-react";
import { useState, useEffect } from "react";

const placeholderAnimationVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.4 } },
};

const playButtonVariants = {
  initial: { opacity: 0, scale: 0 },
  animate: { opacity: 1, scale: 1, transition: { delay: 0.3, type: "spring", stiffness: 100 } },
  pulse: { scale: [1, 1.08, 1], transition: { duration: 2, repeat: Infinity } },
  exit: { opacity: 0, scale: 0, transition: { duration: 0.3 } },
};

const iframeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
};

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

export default function HelpRequestVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  // Auto-play after delay for smooth entrance
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPlaceholder(false);
      setIsPlaying(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handlePlayClick = () => {
    setShowPlaceholder(false);
    setIsPlaying(true);
  };

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
          {/* Placeholder with animations */}
          {showPlaceholder && (
            <motion.div
              key="placeholder"
              variants={placeholderAnimationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black"
            >
              {/* Animated background elements */}
              <motion.div
                className="absolute inset-0 opacity-30"
                initial={{ backgroundPosition: "0% 0%" }}
                animate={{ backgroundPosition: "100% 100%" }}
                transition={{ duration: 20, repeat: Infinity }}
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 50%, rgba(79, 70, 229, 0.2) 0%, transparent 50%)",
                }}
              />

              {/* Play button with pulse animation */}
              <motion.button
                type="button"
                onClick={handlePlayClick}
                variants={playButtonVariants}
                initial="initial"
                animate={["animate", "pulse"]}
                className="relative z-10 focus:outline-none group/button"
              >
                <motion.div
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-2xl"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </motion.div>

                {/* Ripple effect rings */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-indigo-400"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-indigo-300"
                  initial={{ scale: 1, opacity: 0.3 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.button>

              {/* Text prompt */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center"
              >
                <p className="text-sm text-indigo-200 font-medium">Click to watch or video starts automatically</p>
              </motion.div>
            </motion.div>
          )}

          {/* YouTube iframe - shows when playing */}
          {isPlaying && (
            <motion.iframe
              key="video"
              variants={iframeVariants}
              initial="initial"
              animate="animate"
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&autoplay=1"
              title="How to use Help Request on TutorConnect"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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
