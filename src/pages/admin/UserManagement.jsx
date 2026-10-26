import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import "./AdminDocuments.css";

function UserManagement() {
  const [usersList, setUsersList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // ======================================================
  // GET REGISTERED USERS
  // ======================================================

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/users"
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch users"
        );
      }

      const data = await response.json();

      console.log(
        "Users received:",
        data
      );

      setUsersList(data);
    } catch (error) {
      console.error(
        "Error fetching users:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // DELETE USER
  // ======================================================

  const handleDelete = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this user?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete user"
        );
      }

      const result =
        await response.json();

      console.log(
        result.message
      );

      // Remove user from UI
      setUsersList(
        (previousUsers) =>
          previousUsers.filter(
            (user) =>
              user._id !== id
          )
      );
    } catch (error) {
      console.error(
        "Error deleting user:",
        error
      );

      alert(
        "Failed to delete user."
      );
    }
  };

  // ======================================================
  // SEARCH
  // ======================================================

  const filteredUsers =
    usersList.filter(
      (user) => {
        const name =
          user.name || "";

        const email =
          user.email || "";

        return (
          name
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            ) ||
          email
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            )
        );
      }
    );

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}

      <AdminSidebar />

      {/* MAIN */}

      <div className="admin-main">

        {/* TOP BAR */}

        <div className="topbar">

          <div>
            <h1>Users</h1>

            <p>
              Manage all registered users
            </p>
          </div>

          {/* SEARCH */}

          <div className="search-container">

            <input
              type="text"
              placeholder="Search users..."
              className="search-input"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              style={{
                padding:
                  "8px 14px",
                borderRadius:
                  "8px",
                border:
                  "1px solid #d1d5db",
                width:
                  "220px",
              }}
            />

          </div>

        </div>

        {/* TABLE */}

        <div className="table-container">

          <table className="documents-table">

            <thead>

              <tr>

                <th>
                  Name
                </th>

                <th>
                  Email
                </th>

                <th>
                  Role
                </th>

                <th>
                  Joined On
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {/* LOADING */}

              {loading ? (

                <tr>

                  <td
                    colSpan="5"
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "30px",
                      color:
                        "#6b7280",
                    }}
                  >
                    Loading users...
                  </td>

                </tr>

              ) : filteredUsers.length > 0 ? (

                /* USERS */

                filteredUsers.map(
                  (user) => (

                    <tr
                      key={
                        user._id
                      }
                    >

                      {/* NAME */}

                      <td>

                        <span className="file-title">

                          {user.name}

                        </span>

                      </td>

                      {/* EMAIL */}

                      <td>

                        <span
                          className="file-title"
                          style={{
                            color:
                              "#4b5563",
                          }}
                        >

                          {user.email}

                        </span>

                      </td>

                      {/* ROLE */}

                      <td>

                        <span className="type-badge">

                          {user.role ||
                            "Student"}

                        </span>

                      </td>

                      {/* JOINED */}

                      <td className="date-text">

                        {user.joinedOn ||
                          "N/A"}

                      </td>

                      {/* ACTION */}

                      <td>

                        <div className="actions-cell">

                          <button
                            title="Delete User"
                            className="action-btn"
                            onClick={() =>
                              handleDelete(
                                user._id
                              )
                            }
                          >
                            🗑️
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              ) : (

                /* NO USERS */

                <tr>

                  <td
                    colSpan="5"
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "30px",
                      color:
                        "#6b7280",
                    }}
                  >

                    {searchTerm
                      ? "No users found matching your search."
                      : "No registered users found."}

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