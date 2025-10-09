import React from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import QnA from "./components/QnA";
import DiscrepancyChecker from "./components/DiscrepancyChecker";
import RFIDrafting from "./components/RFIDrafting";
import UserProfile from "./components/UserProfile";
import ThemeToggle from "./components/ThemeToggle";

const App = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="p-4 max-w-5xl w-full mx-auto">
          <UserProfile />
          <main className="flex-1 space-y-6 mt-6">
            <QnA />
            <DiscrepancyChecker />
            <RFIDrafting />
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
