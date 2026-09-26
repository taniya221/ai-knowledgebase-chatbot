import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import "./AdminDocuments.css";

function HighlightsManagement() {
  const [highlightsList, setHighlightsList] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/highlights")
      .then((res) => res.json())
      .then((data) => setHighlightsList(data))
      .catch((err) => console.error("Error fetching highlights:", err));
  }, []);

  const handleAddHighlight = async () => {
    const title = prompt("Enter highlight title:");
    if (!title || title.trim() === "") return;
    const priority = prompt("Enter priority (High, Medium, Low):", "Medium");

    try {
      const response = await fetch("http://localhost:5000/api/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, priority }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to add highlight");
      }
      setHighlightsList(result);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/highlights/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      setHighlightsList(result);
    } catch (err) {
      console.error("Error deleting highlight:", err);
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return "badge-high";
      case "medium": return "badge-medium";
      case "low": return "badge-low";
      default: return "badge-medium";
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="topbar">
          <div>
            <h1>Highlights</h1>
            <p>Create and manage important highlights</p>
          </div>
          <button className="upload-btn" onClick={handleAddHighlight}>
            + Add Highlight
          </button>
        </div>

        <div className="table-container">
          <table className="documents-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Priority</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {highlightsList.length > 0 ? (
                highlightsList.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <span className="file-title">{item.title}</span>
                    </td>
                    <td>
                      <span className={`type-badge ${getPriorityBadgeClass(item.priority)}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="date-text">{item.date}</td>
                    <td>
                      <div className="actions-cell">
                        <button title="Delete" className="action-btn" onClick={() => handleDelete(item._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "30px", color: "#6b7280" }}>
                    No highlights added yet. Click "+ Add Highlight" to create one.
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

export default HighlightsManagement;