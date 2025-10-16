import React from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import QnA from "./components/QnA";
import DiscrepancyChecker from "./components/DiscrepancyChecker";
import RFIDrafting from "./components/RFIDrafting";
import UserProfile from "./components/UserProfile";

const App = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <UserProfile />
        <main className="flex-1 p-6 bg-gray-100">
          <QnA />
          <DiscrepancyChecker />
          <RFIDrafting />
        </main>
      </div>
    </div>
  );
};

export default App;
