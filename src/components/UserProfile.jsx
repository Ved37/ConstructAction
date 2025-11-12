import { useState } from "react";

function UserProfile() {
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState({
    name: "anshul",
    email: "anshul@gmail.com",
    company: "abc",
    job_title: "a",
    phone: "123456789",
    created_at: "2025-01-01",
    last_login: "2025-10-25",
    status: "Inactive",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSave = () => {
    // You can integrate with your backend update API here
    console.log("Updated User:", user);
    setEditing(false);
  };

  return (
    <div className="p-6 flex justify-center overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-6">User Profile</h2>

        <div className="flex flex-col items-center mb-6">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="User Avatar"
            className="w-24 h-24 rounded-full mb-4"
          />
          {editing ? (
            <>
              <input
                name="name"
                value={user.name}
                onChange={handleChange}
                className="border px-2 py-1 rounded w-48 text-center"
              />
              <input
                name="email"
                value={user.email}
                onChange={handleChange}
                className="border px-2 py-1 rounded w-48 mt-2 text-center"
              />
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
            </>
          )}
        </div>

        <div className="text-left space-y-2 text-gray-700">
          {editing ? (
            <>
              <div>
                <label className="font-medium">Company:</label>
                <input
                  name="company"
                  value={user.company}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 ml-2"
                />
              </div>
              <div>
                <label className="font-medium">Job Title:</label>
                <input
                  name="job_title"
                  value={user.job_title}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 ml-2"
                />
              </div>
              <div>
                <label className="font-medium">Phone:</label>
                <input
                  name="phone"
                  value={user.phone}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 ml-2"
                />
              </div>
            </>
          ) : (
            <>
              <p>Company: {user.company}</p>
              <p>Job Title: {user.job_title}</p>
              <p>Phone: {user.phone}</p>
              <p>Created At: {user.created_at}</p>
              <p>Last Login: {user.last_login}</p>
              <p className="text-red-600">{user.status}</p>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
              >
                Edit Profile
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
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
