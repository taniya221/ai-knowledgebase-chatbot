
import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import "./AdminDocuments.css";

function HighlightsManagement() {
  const [highlightsList, setHighlightsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // ================= FETCH HIGHLIGHTS =================

  const fetchHighlights = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/highlights"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to fetch highlights"
        );
      }

      const highlights = Array.isArray(data)
        ? data
        : data.highlights || [];

      setHighlightsList(highlights);
    } catch (err) {
      console.error("Error fetching highlights:", err);
      alert(`Could not load highlights: ${err.message}`);
      setHighlightsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  // ================= ADD HIGHLIGHT =================

  const handleAddHighlight = async () => {
    const title = prompt("Enter highlight title:");

    if (!title || !title.trim()) return;

    const priority = prompt(
      "Enter priority (High, Medium, Low):",
      "Medium"
    );

    if (!priority) return;

    const normalizedPriority =
      priority.trim().toLowerCase();

    if (
      !["high", "medium", "low"].includes(
        normalizedPriority
      )
    ) {
      alert("Please enter High, Medium, or Low.");
      return;
    }

    const formattedPriority =
      normalizedPriority.charAt(0).toUpperCase() +
      normalizedPriority.slice(1);

    try {
      const response = await fetch(
        "http://localhost:5000/api/highlights",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            content: title.trim(),
            priority: formattedPriority,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            result.message ||
            "Failed to add highlight"
        );
      }

      if (result.highlight) {
        setHighlightsList((prev) => [
          result.highlight,
          ...prev,
        ]);
      } else {
        await fetchHighlights();
      }
    } catch (err) {
      console.error("Error adding highlight:", err);
      alert(`Could not add highlight: ${err.message}`);
    }
  };

  // ================= DELETE HIGHLIGHT =================

  const handleDelete = async (id) => {
    if (!id || deletingId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this highlight?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response = await fetch(
        `http://localhost:5000/api/highlights/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            result.message ||
            "Failed to delete highlight. Check the backend DELETE route."
        );
      }

      // Update the UI only after the server confirms deletion.
      setHighlightsList((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (err) {
      console.error("Error deleting highlight:", err);
      alert(`Could not delete highlight: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // ================= PRIORITY BADGE =================

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "badge-high";
      case "medium":
        return "badge-medium";
      case "low":
        return "badge-low";
      default:
        return "badge-medium";
    }
  };

  // ================= RENDER =================

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-main">
        <div className="topbar">
          <div>
            <h1>Highlights</h1>
            <p>Create and manage important highlights</p>
          </div>

          <button
            className="upload-btn"
            onClick={handleAddHighlight}
          >
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
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "#6b7280",
                    }}
                  >
                    Loading highlights...
                  </td>
                </tr>
              ) : highlightsList.length > 0 ? (
                highlightsList.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <span className="file-title">
                        {item.title}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`type-badge ${getPriorityBadgeClass(
                          item.priority
                        )}`}
                      >
                        {item.priority || "Medium"}
                      </span>
                    </td>

                    <td className="date-text">
                      {item.createdAt
                        ? new Date(
                            item.createdAt
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td>
                      <div className="actions-cell">
                        <button
                          type="button"
                          title="Delete"
                          aria-label={`Delete ${item.title}`}
                          className="action-btn"
                          disabled={deletingId === item._id}
                          onClick={() =>
                            handleDelete(item._id)
                          }
                        >
                          {deletingId === item._id
                            ? "..."
                            : "🗑️"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "#6b7280",
                    }}
                  >
                    No highlights added yet. Click
                    "+ Add Highlight" to create one.
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
