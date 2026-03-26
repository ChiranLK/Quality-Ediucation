import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Send, Paperclip, Smile } from "lucide-react";

/**
 * ChatWindow
 * @param {{ activeConv: {name:string,avatar:string,color:string}, messages: Array<{id:number,from:string,text:string,time:string}>, message: string, onMessageChange: (v:string)=>void, onSend: ()=>void }} props
 */
export default function ChatWindow({
  activeConv,
  messages,
  message,
  onMessageChange,
  onSend,
}) {
  const handleKey = (e) => {
    if (e.key === "Enter") onSend();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex-1 flex flex-col min-w-0 bg-[#f7f8fc]"
    >
      {/* ── Chat header ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-3 shadow-sm">
        <div
          className={`w-9 h-9 rounded-full ${activeConv.color} flex items-center justify-center
            text-white text-xs font-bold`}
        >
          {activeConv.avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{activeConv.name}</p>
          <p className="text-xs text-green-500 font-medium">Online</p>
        </div>
        <ChevronRight className="ml-auto w-4 h-4 text-gray-300" />
      </div>

      {/* ── Message bubbles ── */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${msg.from === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                  }`}
              >
                <p>{msg.text}</p>
                <p
                  className={`text-[10px] mt-1 text-right
                    ${msg.from === "user" ? "text-indigo-200" : "text-gray-400"}`}
                >
                  {msg.time}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Input bar ── */}
      <div className="bg-white border-t border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-2.5">
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="text-gray-400 hover:text-indigo-500 transition-colors"
            aria-label="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </motion.button>

          <input
            type="text"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message…"
            className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
          />

          <motion.button
            whileHover={{ scale: 1.1 }}
            className="text-gray-400 hover:text-yellow-500 transition-colors"
            aria-label="Emoji"
          >
            <Smile className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={onSend}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition-colors"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
