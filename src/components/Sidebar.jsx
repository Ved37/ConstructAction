// src/components/Sidebar.jsx
import React from "react";

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 text-xl font-bold">Construction Brain</div>
      <nav className="flex-1">
        <ul>
          <li className="p-4 hover:bg-gray-700 cursor-pointer">Dashboard</li>
          <li className="p-4 hover:bg-gray-700 cursor-pointer">Q&A System</li>
          <li className="p-4 hover:bg-gray-700 cursor-pointer">
            Discrepancy Checker
          </li>
          <li className="p-4 hover:bg-gray-700 cursor-pointer">
            RFI/Submittal Drafting
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
