import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Calendar, Tag, Globe, Edit2, X, Trash2 } from "lucide-react";
import CardModal from "./UI/modal";
import customFetch from "../../../utils/customfetch";


export default function SubmittedMessagesModal({ isOpen, onClose, triggerRefresh }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedMessage, setEditedMessage] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

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

  // Handle update message
  const handleUpdateMessage = async (messageId) => {
    if (!editedMessage.trim()) {
      setUpdateError("Message cannot be empty");
      return;
    }

    setUpdating(true);
    setUpdateError(null);

    try {
      // Find the message to get all required fields
      const message = messages.find((msg) => msg._id === messageId);
      
      const response = await customFetch.patch(`/messages/${messageId}`, {
        message: editedMessage,
        title: message.title,
        category: message.category,
        language: message.language,
      });

      if (response.data?.success) {
        // Update local state
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === messageId
              ? { ...msg, message: editedMessage }
              : msg
          )
        );
        setEditingId(null);
        setEditedMessage("");
      }
    } catch (err) {
      setUpdateError(
        err?.response?.data?.msg || "Failed to update message"
      );
    } finally {
      setUpdating(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedMessage("");
    setUpdateError(null);
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId) => {
    // Confirmation dialog
    if (!window.confirm("Are you sure you want to delete this message? This action cannot be undone.")) {
      return;
    }

    setDeletingId(messageId);
    setDeleteError(null);

    try {
      const response = await customFetch.delete(`/messages/${messageId}`);

      if (response.data?.success || response.status === 200) {
        // Remove message from local state
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== messageId)
        );
        // If we were editing this message, clear the edit state
        if (editingId === messageId) {
          setEditingId(null);
          setEditedMessage("");
        }
      }
    } catch (err) {
      setDeleteError(
        err?.response?.data?.msg || "Failed to delete message"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Format messages into card format
  const formattedCards = messages.map((msg, index) => {
    const isEditing = editingId === msg._id;

    return {
      id: msg._id || index,
      badge: msg.category,
      title: msg.title,
      subtitle: msg.language,
      image: getGradientImage(msg.category),
      description: isEditing ? null : msg.message,
      content: isEditing ? (
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Edit Message
            </label>
            <textarea
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows="4"
              placeholder="Enter your updated message..."
            />
          </div>
          {updateError && (
            <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-xs sm:text-sm">
              {updateError}
            </div>
          )}
        </div>
      ) : deleteError ? (
        <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-xs sm:text-sm">
          <p className="font-medium mb-2">Error deleting message:</p>
          <p>{deleteError}</p>
        </div>
      ) : null,
      actions: (
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          {!isEditing ? (
            <>
              <motion.button
                onClick={() => {
                  setEditingId(msg._id);
                  setEditedMessage(msg.message);
                  setUpdateError(null);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-2 sm:px-3 py-1 sm:py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1 flex-1 sm:flex-none"
              >
                <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Update
              </motion.button>
              <motion.button
                onClick={() => handleDeleteMessage(msg._id)}
                disabled={deletingId === msg._id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-2 sm:px-3 py-1 sm:py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1 flex-1 sm:flex-none"
              >
                <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {deletingId === msg._id ? "Deleting..." : "Delete"}
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                onClick={() => handleUpdateMessage(msg._id)}
                disabled={updating}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm sm:text-base font-medium transition-colors"
              >
                {updating ? "Saving..." : "Save"}
              </motion.button>
              <motion.button
                onClick={handleCancelEdit}
                disabled={updating}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm sm:text-base font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Cancel
              </motion.button>
            </>
          )}
        </div>
      ),
      metadata: (
        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {new Date(msg.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {msg.responses || 0} responses
          </div>
        </div>
      ),
    };
  });

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
      showCloseButton={false}
      maxWidth="max-w-lg"
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
