function Sidebar() {
  const chatItems = [
    {
      title: "Project Timeline Questions",
      lastMessage: "What's the status of Phase 2...",
      time: "35m ago",
      messages: 12,
    },
    {
      title: "Budget Analysis",
      lastMessage: "Show me the material cost break...",
      time: "2h ago",
      messages: 8,
    },
    {
      title: "Budget Analysis",
      lastMessage: "Show me the material cost break...",
      time: "2h ago",
      messages: 8,
    },
    {
      title: "Budget Analysis",
      lastMessage: "Show me the material cost break...",
      time: "2h ago",
      messages: 8,
    },
    {
      title: "Budget Analysis",
      lastMessage: "Show me the material cost break...",
      time: "2h ago",
      messages: 8,
    },
    {
      title: "Budget Analysis",
      lastMessage: "Show me the material cost break...",
      time: "2h ago",
      messages: 8,
    },
    {
      title: "Budget Analysis",
      lastMessage: "Show me the material cost break...",
      time: "2h ago",
      messages: 8,
    },
    {
      title: "Budget Analysis",
      lastMessage: "Show me the material cost break...",
      time: "2h ago",
      messages: 8,
    },
    {
      title: "Budget Analysis",
      lastMessage: "Show me the material cost break...",
      time: "2h ago",
      messages: 8,
    },
    {
      title: "Budget Analysis",
      lastMessage: "Show me the material cost break...",
      time: "2h ago",
      messages: 8,
    },
    {
      title: "Budget Analysis",
      lastMessage: "Show me the material cost break...",
      time: "2h ago",
      messages: 8,
    },
    // Add more chat items as needed
  ];

  return (
    <div className="w-80 bg-white border-r flex flex-col h-[calc(100vh-64px)]">
      <div className="p-4 border-b">
        <button className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg flex items-center justify-center">
          <span>+ New Chat</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chatItems.map((item, index) => (
          <div
            key={index}
            className="p-4 border-b hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-gray-900">{item.title}</h3>
              <span className="text-xs text-gray-500">{item.time}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{item.lastMessage}</p>
            <div className="text-xs text-gray-500 mt-1">
              {item.messages} messages
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
