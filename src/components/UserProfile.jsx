import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

function UserProfile() {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
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
    if (!dateString) return "Never";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Load user data when component mounts
  useEffect(() => {
    if (authUser?.user_id) {
      fetchUserData();
    }
  }, [authUser]);

 const fetchUserData = async () => {
  try {
    setLoading(true);
    const userData = await apiFetch(`/api/users/${authUser.user_id}`);
    
    // DEBUG: Check what data you're receiving
    console.log("Raw user data from API:", userData);
    console.log("Last login value:", userData.last_login);
    console.log("Last login type:", typeof userData.last_login);
    
    setUser({
      ...userData,
      status: userData.is_active ? "Active" : "Inactive"
    });
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    alert("Failed to load user profile data.");
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Prepare update data - only send fields that can be updated
      const updateData = {
        name: user.name,
        email: user.email,
        company: user.company,
        job_title: user.job_title,
        phone: user.phone,
      };

      // Validate required fields
      if (!updateData.name.trim() || !updateData.email.trim()) {
        alert("Name and email are required fields.");
        return;
      }

      // Call the update API endpoint
      const updatedUser = await apiFetch(`/api/users/${authUser.user_id}`, {
        method: "PUT",
        body: updateData,
      });

      // Update local state with the response
      setUser({
        ...updatedUser,
        status: updatedUser.is_active ? "Active" : "Inactive"
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
    // Reload original data when canceling
    fetchUserData();
    setEditing(false);
  };

  const handleChangePassword = () => {
    // Implement change password functionality
    alert("Change password functionality to be implemented");
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
              <h3 className="text-xl font-semibold text-gray-800">{user.name}</h3>
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
                  <div className={`px-3 py-2 rounded ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.status}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <p><strong className="text-gray-800">Company:</strong><br />{user.company || "Not specified"}</p>
                <p><strong className="text-gray-800">Job Title:</strong><br />{user.job_title || "Not specified"}</p>
                <p><strong className="text-gray-800">Phone:</strong><br />{user.phone || "Not specified"}</p>
              </div>
              <div className="space-y-3">
                <p><strong className="text-gray-800">Created At:</strong><br />{formatDate(user.created_at)}</p>
                <p><strong className="text-gray-800">Last Login:</strong><br />{formatDate(user.last_login)}</p>
                <p className={user.is_active ? "text-green-600" : "text-red-600"}>
                  <strong>Status:</strong><br />{user.status}
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
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : "Save Changes"}
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
                onClick={handleChangePassword}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
              >
                Change Password
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default UserProfile;