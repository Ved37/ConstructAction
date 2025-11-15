import { useState } from "react";

function Sidebar({ onNewChat, currentProjectId }) {
  const [chatItems, setChatItems] = useState([
    {
      id: 1,
      title: "Project Timeline Questions",
      lastMessage: "What's the status of Phase 2...",
      time: "35m ago",
      messages: 12,
    },
    {
      id: 2,
      title: "Budget Analysis",
      lastMessage: "Show me the material cost break...",
      time: "2h ago",
      messages: 8,
    },
    {
      id: 3,
      title: "Safety Compliance",
      lastMessage: "Check OSHA requirements for...",
      time: "4h ago",
      messages: 5,
    },
    {
      id: 4,
      title: "Material Specifications",
      lastMessage: "What are the concrete grade...",
      time: "1d ago",
      messages: 15,
    },
    {
      id: 5,
      title: "Electrical Layout",
      lastMessage: "Where are the main power...",
      time: "1d ago",
      messages: 7,
    },
  ]);

  const [activeChat, setActiveChat] = useState(null);

  // Handle new chat creation
  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      lastMessage: "Start a new conversation...",
      time: "Just now",
      messages: 0,
    };

    setChatItems((prev) => [newChat, ...prev]);
    setActiveChat(newChat.id);

    // Call parent's new chat handler
    if (onNewChat) {
      onNewChat();
    }
  };

  const handleChatClick = (chatId) => {
    setActiveChat(chatId);
    // Here you would typically load the chat history
    console.log("Loading chat:", chatId);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full fixed left-0 top-0 bottom-0 overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={handleNewChat}
          className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center space-x-2 transition-colors duration-200 font-medium"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {chatItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleChatClick(item.id)}
              className={`p-3 rounded-xl cursor-pointer transition-all duration-200 mb-1 ${
                activeChat === item.id
                  ? "bg-blue-50 border border-blue-200"
                  : "hover:bg-gray-50 border border-transparent"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3
                  className={`font-medium text-sm ${
                    activeChat === item.id ? "text-blue-700" : "text-gray-900"
                  }`}
                >
                  {item.title}
                </h3>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {item.time}
                </span>
              </div>
              <p className="text-xs text-gray-600 truncate mb-1">
                {item.lastMessage}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {item.messages} message{item.messages !== 1 ? "s" : ""}
                </span>
                {activeChat === item.id && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Project #{currentProjectId || 1}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
