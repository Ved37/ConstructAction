import ChatInterface from "./components/ChatInterface";
import QASidebar from "./components/QASidebar";
import React, { useState } from "react";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((v) => !v);

  return (
    <div className="flex flex-1 overflow-hidden h-full bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <QASidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={toggleSidebar}
          />
          <div className="absolute inset-y-0 left-0 w-80 bg-white shadow-lg">
            <QASidebar />
          </div>
        </div>
      )}

      <div className="flex-1 h-full">
        <ChatInterface onToggleSidebar={toggleSidebar} />
      </div>
    </div>
  );
}

export default App;
