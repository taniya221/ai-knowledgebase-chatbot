
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import "./AdminDashboard.css";

function AdminDashboard() {
  console.log("AdminDashboard component loaded");

  const navigate = useNavigate();

  const [stats, setStats] = useState({
    usersCount: 0,
    documentsCount: 0,
    highlightsCount: 0,
    maintenanceStatus: "Inactive",
  });

  const [adminEmail, setAdminEmail] = useState("admin@infohub.com");
  const [recentDocs, setRecentDocs] = useState([]);
  const [recentHighlights, setRecentHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchData = async (url, label) => {
      try {
        const response = await fetch(url);

        console.log(`${label} status:`, response.status);

        if (!response.ok) {
          throw new Error(`${label} request failed (${response.status})`);
        }

        const data = await response.json();
        console.log(`${label} received:`, data);

        return data;
      } catch (error) {
        console.error(`${label} error:`, error);
        return null;
      }
    };

    const fetchDashboardData = async () => {
      setLoading(true);
      setDashboardError("");

      try {
        const [users, documents, highlights, settings] =
          await Promise.all([
            fetchData("http://localhost:5000/api/users", "Users"),
            fetchData("http://localhost:5000/api/documents", "Documents"),
            fetchData("http://localhost:5000/api/highlights", "Highlights"),
            fetchData("http://localhost:5000/api/settings", "Settings"),
          ]);

        if (cancelled) return;

        const usersList = Array.isArray(users) ? users : [];
        const documentsList = Array.isArray(documents) ? documents : [];
        const highlightsList = Array.isArray(highlights)
          ? highlights
          : [];

        setStats({
          usersCount: usersList.length,
          documentsCount: documentsList.length,
          highlightsCount: highlightsList.length,
          maintenanceStatus:
            settings?.maintenanceMode === true ? "Active" : "Inactive",
        });

        setRecentDocs(documentsList.slice(0, 4));
        setRecentHighlights(highlightsList.slice(0, 4));

        if (settings?.adminEmail) {
          setAdminEmail(settings.adminEmail);
        }

        if (!users && !documents && !highlights) {
          setDashboardError(
            "Unable to load dashboard data. Check that the backend is running."
          );
        }
      } catch (error) {
        console.error("Dashboard data error:", error);

        if (!cancelled) {
          setDashboardError(
            "Unable to load dashboard data. Please check the backend."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      cancelled = true;
    };
  }, []);

  const adminName = localStorage.getItem("name") || "Admin";
  const storedEmail = localStorage.getItem("email") || adminEmail;

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-main">
        {/* TOP BAR */}
        <div className="topbar">
          <div>
            <h1>Admin Dashboard</h1>
            <p>
              Welcome back! Here's what's happening with InfoHub.
            </p>
          </div>

          <div className="admin-profile">
            <div className="profile-circle">
              {adminName.charAt(0).toUpperCase()}
            </div>

            <div>
              <h4>{adminName}</h4>
              <p>{storedEmail}</p>
            </div>
          </div>
        </div>

        {dashboardError && (
          <p role="alert" className="empty-message">
            {dashboardError}
          </p>
        )}

        {/* STAT CARDS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">👥</div>
            <div>
              <p>Total Users</p>
              <h2>{loading ? "..." : stats.usersCount}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">📄</div>
            <div>
              <p>Total Documents</p>
              <h2>{loading ? "..." : stats.documentsCount}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">⭐</div>
            <div>
              <p>Total Highlights</p>
              <h2>{loading ? "..." : stats.highlightsCount}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pink">⚙</div>
            <div>
              <p>Maintenance Mode</p>
              <h2>{loading ? "..." : stats.maintenanceStatus}</h2>
            </div>
          </div>
        </div>

        {/* RECENT SECTIONS */}
        <div className="dashboard-sections">
          {/* RECENT DOCUMENTS */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Recent Documents</h3>

              <button
                type="button"
                onClick={() => navigate("/admin/documents")}
              >
                View All
              </button>
            </div>

            {recentDocs.length > 0 ? (
              recentDocs.map((doc, index) => (
                <div
                  key={doc._id || doc.id || index}
                  className="document-row"
                >
                  <div className="doc-icon-box">📕</div>

                  <div>
                    <h4>
                      {doc.title || doc.name || "Untitled Document"}
                    </h4>

                    <p>
                      {doc.date ||
                        doc.uploadDate ||
                        (doc.createdAt
                          ? new Date(doc.createdAt).toLocaleDateString()
                          : "Recent")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-message">
                {loading ? "Loading documents..." : "No documents found."}
              </p>
            )}
          </div>

          {/* RECENT HIGHLIGHTS */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Recent Highlights</h3>

              <button
                type="button"
                onClick={() => navigate("/admin/highlights")}
              >
                View All
              </button>
            </div>

            {recentHighlights.length > 0 ? (
              recentHighlights.map((high, index) => (
                <div
                  key={high._id || high.id || index}
                  className="highlight-row"
                >
                  <div className="high-icon-box">⭐</div>

                  <div>
                    <h4>{high.title || "Untitled Highlight"}</h4>

                    <p>
                      {high.priority
                        ? `Priority: ${high.priority} | `
                        : ""}
                      {high.date ||
                        (high.createdAt
                          ? new Date(high.createdAt).toLocaleDateString()
                          : "Recent")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-message">
                {loading ? "Loading highlights..." : "No highlights found."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
