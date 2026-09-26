import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState({
    usersCount: 0,
    documentsCount: 0,
    highlightsCount: 0,
    maintenanceStatus: "Inactive",
  });
  const [recentDocs, setRecentDocs] = useState([]);
  const [recentHighlights, setRecentHighlights] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/api/users").then((res) => res.json()),
      fetch("http://localhost:5000/api/documents").then((res) => res.json()),
      fetch("http://localhost:5000/api/highlights").then((res) => res.json()),
      fetch("http://localhost:5000/api/settings").then((res) => res.json()),
    ])
      .then(([users, docs, highlights, settings]) => {
        setStats({
          usersCount: users.length || 0,
          documentsCount: docs.length || 0,
          highlightsCount: highlights.length || 0,
          maintenanceStatus: settings.maintenanceMode ? "Active" : "Inactive",
        });
        setRecentDocs(docs.slice(0, 4));
        setRecentHighlights(highlights.slice(0, 4));
      })
      .catch((err) => console.error("Error fetching dashboard live data:", err));
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-main">
        <div className="topbar">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome back! Here's what's happening with KnoAI.</p>
          </div>

          <div className="admin-profile">
            <div className="profile-circle">A</div>
            <div>
              <h4>Admin</h4>
              <p>admin@infohub.com</p>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">👥</div>
            <div>
              <p>Total Users</p>
              <h2>{stats.usersCount}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">📄</div>
            <div>
              <p>Total Documents</p>
              <h2>{stats.documentsCount}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">⭐</div>
            <div>
              <p>Total Highlights</p>
              <h2>{stats.highlightsCount}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pink">⚙</div>
            <div>
              <p>Maintenance Mode</p>
              <h2>{stats.maintenanceStatus}</h2>
            </div>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Recent Documents</h3>
              <button>View All</button>
            </div>

            {recentDocs.length > 0 ? (
              recentDocs.map((doc) => (
                <div key={doc._id} className="document-row">
                  <div className="doc-icon-box">📕</div>
                  <div>
                    <h4>{doc.title || doc.name}</h4>
                    <p>{doc.uploadDate || "Recent"}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "#6b7280", fontSize: "14px" }}>No documents found.</p>
            )}
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3>Recent Highlights</h3>
              <button>View All</button>
            </div>

            {recentHighlights.length > 0 ? (
              recentHighlights.map((high) => (
                <div key={high._id} className="highlight-row">
                  <div className="high-icon-box">⭐</div>
                  <div>
                    <h4>{high.title}</h4>
                    <p>Priority: {high.priority} | {high.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "#6b7280", fontSize: "14px" }}>No highlights found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;