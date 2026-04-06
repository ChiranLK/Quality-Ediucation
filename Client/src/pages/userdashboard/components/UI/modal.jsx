import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

/**
 * Professional Card Modal Component
 * Features: Multi-card support, smooth animations, keyboard navigation, accessibility
 */

const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const modalVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.4,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

const cardVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 500 : -500,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 500 : -500,
    opacity: 0,
  }),
};

export default function CardModal({
  isOpen,
  onClose,
  cards = [],
  initialIndex = 0,
  showNavigation = true,
  showIndicators = true,
  onCardChange = null,
  closeOnBackdropClick = true,
  closeOnEsc = true,
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);

  const totalCards = cards.length;
  const currentCard = totalCards > 0 ? cards[currentIndex] : null;

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && showNavigation) {
        handlePrevious();
      } else if (e.key === "ArrowRight" && showNavigation) {
        handleNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEsc, showNavigation, currentIndex, totalCards]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleNext = () => {
    if (totalCards <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalCards);
    if (onCardChange) onCardChange((currentIndex + 1) % totalCards);
  };

  const handlePrevious = () => {
    if (totalCards <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
    if (onCardChange) onCardChange((currentIndex - 1 + totalCards) % totalCards);
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const goToCard = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    if (onCardChange) onCardChange(index);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={handleBackdropClick}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative z-10 w-full max-w-2xl mx-4"
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              className="absolute -top-10 right-0 p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </motion.button>

            {/* Cards Container */}
            {currentCard ? (
              <div className="relative">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={cardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.4 },
                    }}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
                  >
                    {/* Card Header Image */}
                    {currentCard.image && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-full h-64 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700"
                      >
                        <img
                          src={currentCard.image}
                          alt={currentCard.title || "Card"}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </motion.div>
                    )}

                    {/* Card Content */}
                    <div className="p-8">
                      {/* Badge */}
                      {currentCard.badge && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="mb-4"
                        >
                          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold uppercase tracking-wider">
                            {currentCard.badge}
                          </span>
                        </motion.div>
                      )}

                      {/* Title */}
                      {currentCard.title && (
                        <motion.h2
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                          className="text-3xl font-bold text-gray-900 dark:text-white mb-3"
                        >
                          {currentCard.title}
                        </motion.h2>
                      )}

                      {/* Subtitle */}
                      {currentCard.subtitle && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-lg text-gray-600 dark:text-gray-400 mb-4"
                        >
                          {currentCard.subtitle}
                        </motion.p>
                      )}

                      {/* Description */}
                      {currentCard.description && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 }}
                          className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6"
                        >
                          {typeof currentCard.description === "string" ? (
                            <p>{currentCard.description}</p>
                          ) : (
                            currentCard.description
                          )}
                        </motion.div>
                      )}

                      {/* Content Slots */}
                      {currentCard.content && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="mb-6"
                        >
                          {currentCard.content}
                        </motion.div>
                      )}

                      {/* Actions */}
                      {currentCard.actions && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 }}
                          className="flex gap-3 flex-wrap"
                        >
                          {currentCard.actions}
                        </motion.div>
                      )}

                      {/* Metadata */}
                      {currentCard.metadata && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400"
                        >
                          {currentCard.metadata}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {showNavigation && totalCards > 1 && (
                  <>
                    <motion.button
                      onClick={handlePrevious}
                      whileHover={{ scale: 1.1, x: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 -translate-x-12 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl text-gray-900 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      aria-label="Previous card"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </motion.button>

                    <motion.button
                      onClick={handleNext}
                      whileHover={{ scale: 1.1, x: 4 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 translate-x-12 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl text-gray-900 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      aria-label="Next card"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </motion.button>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center text-gray-500 dark:text-gray-400">
                No cards to display
              </div>
            )}

            {/* Indicators */}
            {showIndicators && totalCards > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-2 mt-6"
              >
                {cards.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => goToCard(index)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-white/90 w-8 shadow-lg"
                        : "bg-white/40 w-2 hover:bg-white/60"
                    }`}
                    aria-label={`Go to card ${index + 1}`}
                  />
                ))}
              </motion.div>
            )}

            {/* Card Counter */}
            {totalCards > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center mt-4 text-sm text-white/70"
              >
                {currentIndex + 1} / {totalCards}
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
