import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Calendar, Tag, Globe } from "lucide-react";
import CardModal from "./UI/modal";
import customFetch from "../../../utils/customfetch";

/**
 * Submitted Messages Modal Component
 * Displays user's submitted help requests in a card modal with smooth animations
 */

export default function SubmittedMessagesModal({ isOpen, onClose, triggerRefresh }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch submitted messages
  useEffect(() => {
    if (!isOpen) return;

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await customFetch.get("/messages");
        // Backend returns { messages: [...] } structure
        if (response.data?.messages && Array.isArray(response.data.messages)) {
          setMessages(response.data.messages);
        } else {
          setMessages([]);
        }
      } catch (err) {
        setError(err?.response?.data?.msg || "Failed to fetch messages");
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [isOpen, triggerRefresh]);

  // Format messages into card format
  const formattedCards = messages.map((msg, index) => ({
    id: msg._id || index,
    badge: msg.category,
    title: msg.title,
    subtitle: msg.language,
    image: getGradientImage(msg.category),
    description: msg.message,
    metadata: (
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(msg.createdAt).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5" />
          {msg.responses || 0} responses
        </div>
      </div>
    ),
  }));

  // Generate gradient image based on category
  function getGradientImage(category) {
    const gradients = {
      Mathematics: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      Science: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      "IT & Programming": "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
      English: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
      History: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      Geography: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
      Physics: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
      Chemistry: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
      Other: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
    };

    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='400' fill='url(%23grad)'/%3E%3C/svg%3E`;
  }

  return (
    <CardModal
      isOpen={isOpen}
      onClose={onClose}
      cards={
        loading
          ? [
              {
                badge: "Loading",
                title: "Fetching your messages...",
                subtitle: "Please wait",
                description: "Loading your submitted requests",
              },
            ]
          : error
          ? [
              {
                badge: "Error",
                title: "Failed to Load",
                subtitle: "Error",
                description: error,
              },
            ]
          : formattedCards.length > 0
          ? formattedCards
          : [
              {
                badge: "Empty",
                title: "No Messages Yet",
                subtitle: "Start requesting help",
                description:
                  "You haven't submitted any help requests yet. Submit your first request using the form below!",
              },
            ]
      }
      showNavigation={formattedCards.length > 1}
      showIndicators={formattedCards.length > 1}
      onCardChange={(index) => {
        // Can add analytics or tracking here
      }}
    />
  );
}
