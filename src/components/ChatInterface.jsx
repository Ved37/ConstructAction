function ChatInterface() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
            AI
          </div>
          <div className="bg-white p-4 rounded-lg shadow max-w-2xl">
            <p>
              Hello! I'm your construction project copilot. I can help you find
              information across all your project data sources. What would you
              like to know?
            </p>
          </div>
        </div>
        {/* Add more messages here */}
      </div>
      <div className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Ask about your project..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
