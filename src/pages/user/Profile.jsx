import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const userName = localStorage.getItem("name") || "User";
  const userEmail = localStorage.getItem("email") || "Not available";
  const userRole = localStorage.getItem("role") || "User";

  const handleLogout = () => {
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    navigate("/login");
  };

  return (
    <div className="profile-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="user-sidebar">

        <div className="user-logo">
          <div className="user-logo-icon">
            🧠
          </div>

          <span>InfoHub</span>
        </div>

        <nav className="user-navigation">

          <Link
            to="/user/dashboard"
            className="user-nav-item"
          >
            <span className="nav-icon">⌂</span>
            <span>Home</span>
          </Link>

          <Link
            to="/user/chat"
            className="user-nav-item"
          >
            <span className="nav-icon">◉</span>
            <span>AI Chat</span>
          </Link>

          <Link
            to="/user/documents"
            className="user-nav-item"
          >
            <span className="nav-icon">▣</span>
            <span>Documents</span>
          </Link>

          <Link
            to="/user/highlights"
            className="user-nav-item"
          >
            <span className="nav-icon">✦</span>
            <span>Highlights</span>
          </Link>

          <Link
            to="/user/history"
            className="user-nav-item"
          >
            <span className="nav-icon">◷</span>
            <span>History</span>
          </Link>

          <Link
            to="/user/profile"
            className="user-nav-item active"
          >
            <span className="nav-icon">○</span>
            <span>Profile</span>
          </Link>

        </nav>

        <button
          className="user-logout-button"
          onClick={handleLogout}
        >
          <span>↪</span>
          Logout
        </button>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="profile-main">

        {/* HEADER */}

        <header className="profile-header">

          <div>
            <h1>Profile</h1>

            <p>
              Manage and view your InfoHub account
            </p>
          </div>

        </header>

        {/* ================= PROFILE CARD ================= */}

        <section className="profile-card">

          <div className="profile-card-header">

            <div className="profile-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2>{userName}</h2>

              <p>
                {userEmail}
              </p>
            </div>

          </div>

          {/* ================= ACCOUNT INFORMATION ================= */}

          <div className="profile-section">

            <h3>Account Information</h3>

            <div className="profile-info-grid">

              <div className="profile-info-item">

                <span className="profile-label">
                  Full Name
                </span>

                <span className="profile-value">
                  {userName}
                </span>

              </div>

              <div className="profile-info-item">

                <span className="profile-label">
                  Email Address
                </span>

                <span className="profile-value">
                  {userEmail}
                </span>

              </div>

              <div className="profile-info-item">

                <span className="profile-label">
                  Account Role
                </span>

                <span className="profile-role">
                  {userRole}
                </span>

              </div>

              <div className="profile-info-item">

                <span className="profile-label">
                  Account Status
                </span>

                <span className="profile-status">
                  Active
                </span>

              </div>

            </div>

          </div>

          {/* ================= ABOUT ================= */}

          <div className="profile-section">

            <h3>About InfoHub</h3>

            <p className="profile-about">
              InfoHub is an intelligent knowledge assistant
              that helps users find information from the
              available knowledge base using AI-powered
              question answering.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Profile;