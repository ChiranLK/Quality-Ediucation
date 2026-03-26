import { motion } from "framer-motion";

/**
 * ConversationList
 * @param {{ conversations: Array<{id:number,name:string,avatar:string,color:string,last:string,time:string,unread:number}>, activeId: number, onSelect: (conv:object)=>void }} props
 */
export default function ConversationList({ conversations, activeId, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="w-72 bg-white border-r border-gray-100 flex flex-col shrink-0"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-900">Messages</h2>
        <p className="text-xs text-gray-400 mt-0.5">Your tutor conversations</p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv, i) => (
          <motion.button
            key={conv.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.07 }}
            whileHover={{ backgroundColor: "#f5f3ff" }}
            onClick={() => onSelect(conv)}
            className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors
              ${activeId === conv.id
                ? "bg-indigo-50 border-l-2 border-indigo-500"
                : "hover:bg-gray-50"
              }`}
          >
            {/* Avatar */}
            <div
              className={`w-10 h-10 rounded-full ${conv.color} flex items-center justify-center
                text-white text-xs font-bold shrink-0`}
            >
              {conv.avatar}
            </div>

            {/* Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800 truncate">{conv.name}</span>
                <span className="text-xs text-gray-400 shrink-0 ml-1">{conv.time}</span>
              </div>
              <p className="text-xs text-gray-400 truncate mt-0.5">{conv.last}</p>
            </div>

            {/* Unread badge */}
            {conv.unread > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {conv.unread}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
