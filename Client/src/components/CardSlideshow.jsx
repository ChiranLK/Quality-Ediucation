import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const slideVariants = {
  initial: (direction) => ({
    x: direction > 0 ? 500 : -500,
    opacity: 0,
    scale: 0.9,
  }),
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? -500 : 500,
    opacity: 0,
    scale: 0.9,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  }),
};

export default function CardSlideshow({
  cards = [],
  autoPlay = true,
  autoPlayInterval = 5000,
  showIndicators = true,
  showNavigation = true,
  onCardChange = null,
  height = "h-48",
}) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const paginate = (newDirection) => {
    if (!cards.length) return;
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + cards.length) % cards.length);
    if (onCardChange) {
      onCardChange((current + newDirection + cards.length) % cards.length);
    }
  };

  // Auto-play logic
  useEffect(() => {
    if (!autoPlay || isHovering || cards.length <= 1) return;

    const interval = setInterval(() => {
      paginate(1);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isHovering, cards.length, current]);

  if (!cards.length) {
    return (
      <div className={`flex items-center justify-center ${height} bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl`}>
        <p className="text-gray-500 dark:text-gray-400">No slides to display</p>
      </div>
    );
  }

  const currentCard = cards[current];

  return (
    <div
      className="w-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Slideshow Container */}
      <div className={`relative rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-900 ${height}`}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 p-4 md:p-6 flex flex-col justify-between"
          >
            {/* Content */}
            <div>
              {/* Badge */}
              {currentCard.badge && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-2 inline-block"
                >
                  <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {currentCard.badge}
                  </span>
                </motion.div>
              )}

              {/* Title */}
              {currentCard.title && (
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1"
                >
                  {currentCard.title}
                </motion.h3>
              )}

              {/* Description */}
              {currentCard.description && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-gray-600 dark:text-gray-400 text-xs md:text-sm leading-relaxed max-w-md"
                >
                  {currentCard.description}
                </motion.p>
              )}
            </div>

            {/* Action Button */}
            {currentCard.action && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                {currentCard.action}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {showNavigation && cards.length > 1 && (
          <>
            <motion.button
              onClick={() => paginate(-1)}
              whileHover={{ scale: 1.1, x: -4 }}
              whileTap={{ scale: 0.95 }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg hover:shadow-xl text-gray-900 dark:text-white transition-all backdrop-blur-sm"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>

            <motion.button
              onClick={() => paginate(1)}
              whileHover={{ scale: 1.1, x: 4 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg hover:shadow-xl text-gray-900 dark:text-white transition-all backdrop-blur-sm"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </>
        )}
      </div>

      {/* Indicators */}
      {showIndicators && cards.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 mt-2.5"
        >
          {cards.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setDirection(index > current ? 1 : -1);
                setCurrent(index);
                if (onCardChange) {
                  onCardChange(index);
                }
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={`h-2 rounded-full transition-all ${
                index === current
                  ? "bg-indigo-600 dark:bg-indigo-400 w-8"
                  : "bg-gray-300 dark:bg-gray-600 w-2 hover:bg-gray-400 dark:hover:bg-gray-500"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
