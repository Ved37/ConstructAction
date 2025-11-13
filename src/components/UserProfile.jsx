import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

function UserProfile() {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const { user: authUser } = useAuth();
  const [user, setUser] = useState({
    user_id: "",
    name: "",
    email: "",
    company: "",
    job_title: "",
    phone: "",
    created_at: "",
    last_login: "",
    is_active: true,
  });

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString || dateString === "null" || dateString === "undefined") {
      return "Never";
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Never";
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Never";
    }
  };

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await apiFetch(`/api/users/${authUser.user_id}`);
      setUser({
        ...userData,
        status: userData.is_active ? "Active" : "Inactive",
      });
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      alert("Failed to load user profile data.");
    } finally {
      setLoading(false);
    }
  }, [authUser?.user_id]);

  // Load user data when component mounts
  useEffect(() => {
    if (authUser?.user_id) {
      fetchUserData();
    }
  }, [authUser, fetchUserData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleChangePassword = async () => {
    // Validate passwords
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.new_password.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError("");

      // DEBUG: Check if token exists
      const token = localStorage.getItem("ca_token");
      console.log("Token exists:", !!token);
      console.log("Token value:", token);

      await apiFetch("/api/change-password", {
        method: "PUT",
        body: {
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        },
        // auth: true is the default, so we don't need to specify it
      });

      alert("Password changed successfully!");
      setShowChangePassword(false);
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.error("Failed to change password:", error);
      console.error("Error status:", error.status);
      console.error("Error data:", error.data);

      // Extract error message from the response
      const errorMessage =
        error.data?.detail ||
        error.message ||
        "Failed to change password. Please check your current password.";
      setPasswordError(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const updateData = {
        name: user.name,
        email: user.email,
        company: user.company,
        job_title: user.job_title,
        phone: user.phone,
      };

      if (!updateData.name.trim() || !updateData.email.trim()) {
        alert("Name and email are required fields.");
        return;
      }

      const updatedUser = await apiFetch(`/api/users/${authUser.user_id}`, {
        method: "PUT",
        body: updateData,
      });

      setUser({
        ...updatedUser,
        status: updatedUser.is_active ? "Active" : "Inactive",
      });

      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update user:", error);
      alert("Failed to update user profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    fetchUserData();
    setEditing(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const closePasswordModal = () => {
    setShowChangePassword(false);
    setPasswordData({
      current_password: "",
      new_password: "",
      confirm_password: "",
    });
    setPasswordError("");
  };

  if (loading && !user.user_id) {
    return (
      <div className="p-6 flex justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl">
          <div className="text-center">Loading user profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex justify-center overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-6">User Profile</h2>

        <div className="flex flex-col items-center mb-6">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="User Avatar"
            className="w-24 h-24 rounded-full mb-4 border-2 border-gray-300"
          />
          {editing ? (
            <div className="text-center space-y-2">
              <input
                name="name"
                value={user.name}
                onChange={handleChange}
                className="border border-gray-300 px-3 py-2 rounded w-64 text-center text-lg font-semibold"
                disabled={loading}
                placeholder="Full Name"
              />
              <input
                name="email"
                value={user.email}
                onChange={handleChange}
                className="border border-gray-300 px-3 py-2 rounded w-64 text-center text-gray-600"
                disabled={loading}
                placeholder="Email Address"
                type="email"
              />
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800">
                {user.name}
              </h3>
              <p className="text-gray-600">{user.email}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mb-6">
          {editing ? (
            <>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="font-medium text-sm mb-1">Company:</label>
                  <input
                    name="company"
                    value={user.company || ""}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2"
                    disabled={loading}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-medium text-sm mb-1">Job Title:</label>
                  <input
                    name="job_title"
                    value={user.job_title || ""}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2"
                    disabled={loading}
                    placeholder="Enter job title"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="font-medium text-sm mb-1">Phone:</label>
                  <input
                    name="phone"
                    value={user.phone || ""}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2"
                    disabled={loading}
                    placeholder="Enter phone number"
                    type="tel"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-medium text-sm mb-1">Status:</label>
                  <div
                    className={`px-3 py-2 rounded ${
                      user.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <p>
                  <strong className="text-gray-800">Company:</strong>
                  <br />
                  {user.company || "Not specified"}
                </p>
                <p>
                  <strong className="text-gray-800">Job Title:</strong>
                  <br />
                  {user.job_title || "Not specified"}
                </p>
                <p>
                  <strong className="text-gray-800">Phone:</strong>
                  <br />
                  {user.phone || "Not specified"}
                </p>
              </div>
              <div className="space-y-3">
                <p>
                  <strong className="text-gray-800">Created At:</strong>
                  <br />
                  {formatDate(user.created_at)}
                </p>
                <p>
                  <strong className="text-gray-800">Last Login:</strong>
                  <br />
                  {formatDate(user.last_login)}
                </p>
                <p
                  className={user.is_active ? "text-green-600" : "text-red-600"}
                >
                  <strong>Status:</strong>
                  <br />
                  {user.status}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition duration-200"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="bg-yellow-500 text-white px-6 py-2 rounded-md hover:bg-yellow-600 transition duration-200"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setShowChangePassword(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
              >
                Change Password
              </button>
            </>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Change Password</h3>

            {passwordError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {passwordError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closePasswordModal}
                disabled={passwordLoading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={passwordLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
              >
                {passwordLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Changing...
                  </span>
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
