//import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatInterface from "./components/ChatInterface";
import Header from "./components/Header";

function App() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <ChatInterface />
      </div>
    </div>
  );
}

export default App;
