import React from "react";
import "../styles/UserProfile.css";

const UserProfile = () => {
  // Replace with real data if available
  const user = {
    name: "John Doe",
    email: "john.doe@email.com",
    avatar: "https://ui-avatars.com/api/?name=John+Doe&background=random",
  };

  return (
    <div className="user-profile dark:bg-gray-800 dark:border-gray-700 transition mb-6">
      <img src={user.avatar} alt="User Avatar" className="user-avatar" />
      <div className="user-info">
        <span className="user-name dark:text-gray-100">{user.name}</span>
        <span className="user-email dark:text-gray-400">{user.email}</span>
      </div>
    </div>
  );
};

export default UserProfile;
