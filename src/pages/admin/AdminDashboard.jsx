import React from "react";
import AdminSidebar from "../../components/AdminSidebar";
import "./AdminDashboard.css";

function AdminDashboard() {
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
              <p>admin@knoai.com</p>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">👥</div>
            <div>
              <p>Total Users</p>
              <h2>150</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">📄</div>
            <div>
              <p>Total Documents</p>
              <h2>45</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">⭐</div>
            <div>
              <p>Total Highlights</p>
              <h2>18</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pink">💬</div>
            <div>
              <p>Total Chats</p>
              <h2>320</h2>
            </div>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Recent Documents</h3>
              <button>View All</button>
            </div>

            <div className="document-row">
              <div className="doc-icon-box">📕</div>
              <div>
                <h4>DBMS_Notes.pdf</h4>
                <p>Aug 12, 2026</p>
              </div>
            </div>

            <div className="document-row">
              <div className="doc-icon-box">📕</div>
              <div>
                <h4>Cloud_Computing.pdf</h4>
                <p>Aug 10, 2026</p>
              </div>
            </div>

            <div className="document-row">
              <div className="doc-icon-box">📕</div>
              <div>
                <h4>Placement_Guide.pdf</h4>
                <p>Aug 08, 2026</p>
              </div>
            </div>

            <div className="document-row">
              <div className="doc-icon-box">📕</div>
              <div>
                <h4>Python_Notes.pdf</h4>
                <p>Aug 05, 2026</p>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3>Recent Highlights</h3>
              <button>View All</button>
            </div>

            <div className="highlight-row">
              <div className="high-icon-box">⭐</div>
              <div>
                <h4>Placement Registration Extended</h4>
                <p>Aug 12, 2026</p>
              </div>
            </div>

            <div className="highlight-row">
              <div className="high-icon-box">⭐</div>
              <div>
                <h4>DBMS Assignment Uploaded</h4>
                <p>Aug 10, 2026</p>
              </div>
            </div>

            <div className="highlight-row">
              <div className="high-icon-box">⭐</div>
              <div>
                <h4>Cloud Workshop Scheduled</h4>
                <p>Aug 07, 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;