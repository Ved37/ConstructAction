import React from "react";
import "./UserProfile.css";

const UserProfile = () => {
  return (
    <div className="user-profile">
      <img
        className="user-avatar"
        src="/src/assets/default-avatar.png"
        alt="User Avatar"
      />
      <div className="user-info">
        <h2 className="user-name">John Doe</h2>
        <p className="user-email">johndoe@example.com</p>
      </div>
    </div>
  );
};

export default UserProfile;
