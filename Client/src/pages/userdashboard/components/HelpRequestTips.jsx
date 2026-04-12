import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import CardSlideshow from "../../../components/CardSlideshow";

export default function HelpRequestTips() {
  const slideshowCards = [
    {
      badge: "💡 Pro Tip",
      title: "Be Specific & Clear",
      description: "The more detailed your request, the faster tutors can help. Include what you've tried and where you're stuck.",
      action: (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block"
        >
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors">
            Learn More
          </button>
        </motion.div>
      ),
    },
    {
      badge: "🌍 Language Support",
      title: "Request Help in Your Language",
      description: "We support 9 different languages! Choose your preferred language to communicate comfortably with tutors.",
      action: (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block"
        >
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors">
            View Languages
          </button>
        </motion.div>
      ),
    },
    {
      badge: "⚡ Quick Response",
      title: "Get Help Instantly",
      description: "Once you submit, available tutors will see your request immediately. Average response time is under 5 minutes!",
      action: (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block"
        >
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
            Ready to Go
          </button>
        </motion.div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Tips for Success
        </h2>
      </div>
      <CardSlideshow
        cards={slideshowCards}
        autoPlay={true}
        autoPlayInterval={5000}
        showIndicators={true}
        showNavigation={false}
        height="h-52"
      />
    </motion.div>
  );
}
