import {
  ChartColumn,
  MessageCircle,
  User2,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const [activeTab, setActiveTab] = useState("chat");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  return (
    <div className="flex justify-between shadow-md">
      <div id="logo" className="my-6 pl-5 text-2xl text-blue-500 font-bold">
        <Link to="/">ConstrcutAction</Link>
      </div>
      <div
        id="toggle"
        className="my-6 h-fit bg-gray-200 rounded-4xl font-medium"
      >
        <button
          className={`px-4 py-2 rounded-4xl transition cursor-pointer ${
            activeTab === "dashboard"
              ? "bg-blue-500 text-white"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("dashboard")}
        >
          <span className="flex items-center">
            <ChartColumn size={16} />
            <span className="px-1">Dashboard</span>
          </span>
        </button>
        <button
          className={`px-4 py-2 rounded-4xl transition cursor-pointer ${
            activeTab === "chat" ? "bg-blue-500 text-white" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("chat")}
        >
          <span className="flex items-center">
            <MessageCircle size={16} />
            <span className="px-1">Chat</span>
          </span>
        </button>
      </div>
      <div id="user" className="my-6 pr-5">
        {user ? (
          <div className="flex items-center gap-2">
            <span className="p-2 font-medium flex items-center border-2 border-gray-300 bg-gray-100 rounded-md">
              <User2 size={16} />
              <span className="px-1">{user.name || user.email}</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-2 rounded-md text-red-600 border border-red-200 hover:bg-red-50"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="flex items-center gap-1 px-3 py-2 rounded-md text-blue-600 border border-blue-200 hover:bg-blue-50"
            >
              <LogIn size={16} /> Login
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1 px-3 py-2 rounded-md text-green-600 border border-green-200 hover:bg-green-50"
            >
              <UserPlus size={16} /> Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
