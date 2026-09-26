import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import "./AdminDocuments.css";

function UserManagement() {
  const [usersList, setUsersList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then((data) => setUsersList(data))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      setUsersList(result);
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const filteredUsers = usersList.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="topbar">
          <div>
            <h1>Users</h1>
            <p>Manage all registered users</p>
          </div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search users..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #d1d5db", width: "220px" }}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="documents-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <span className="file-title">{user.name}</span>
                    </td>
                    <td>
                      <span className="file-title" style={{ color: "#4b5563" }}>{user.email}</span>
                    </td>
                    <td>
                      <span className="type-badge">{user.role}</span>
                    </td>
                    <td className="date-text">{user.joinedOn}</td>
                    <td>
                      <div className="actions-cell">
                        <button title="Delete" className="action-btn" onClick={() => handleDelete(user._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#6b7280" }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;