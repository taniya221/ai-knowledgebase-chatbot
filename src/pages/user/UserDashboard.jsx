
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UserDashboard.css";

function UserDashboard() {
  const navigate = useNavigate();

  // ================= USER DETAILS =================

  const userName = localStorage.getItem("name") || "User";
  const userEmail = localStorage.getItem("email") || "";

  // ================= STATES =================

  const [documents, setDocuments] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH DATA =================

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // ================= DOCUMENTS =================

      const documentsResponse = await fetch(
        "http://localhost:5000/api/documents"
      );

      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();

        if (Array.isArray(documentsData)) {
          setDocuments(documentsData);
        } else {
          setDocuments([]);
        }
      }

      // ================= HIGHLIGHTS =================

      const highlightsResponse = await fetch(
        "http://localhost:5000/api/highlights"
      );

      if (highlightsResponse.ok) {
        const highlightsData = await highlightsResponse.json();

        if (Array.isArray(highlightsData)) {
          setHighlights(highlightsData);
        } else {
          setHighlights([]);
        }
      }
    } catch (error) {
      console.error(
        "Error loading dashboard data:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= LOGOUT =================

  const handleLogout = () => {
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    navigate("/login");
  };

  // ================= PRIORITY =================

  const getPriorityClass = (priority) => {
    if (!priority) {
      return "medium";
    }

    return priority.toLowerCase();
  };

  const getPriorityText = (priority) => {
    if (!priority) {
      return "Medium Priority";
    }

    return `${priority} Priority`;
  };

  // ================= RENDER =================

  return (
    <div className="user-dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside className="user-sidebar">

        {/* Logo */}

        <div className="user-logo">

          <div className="user-logo-icon">
            🧠
          </div>

          <span>InfoHub</span>

        </div>

        {/* Navigation */}

        <nav className="user-navigation">

          <Link
            to="/user-dashboard"
            className="user-nav-item active"
          >
            <span className="nav-icon">⌂</span>
            <span>Home</span>
          </Link>

          <Link
            to="/chat"
            className="user-nav-item"
          >
            <span className="nav-icon">◉</span>
            <span>AI Chat</span>
          </Link>

          <Link
            to="/documents"
            className="user-nav-item"
          >
            <span className="nav-icon">▣</span>
            <span>Documents</span>
          </Link>

          <Link
            to="/highlights"
            className="user-nav-item"
          >
            <span className="nav-icon">✦</span>
            <span>Highlights</span>
          </Link>

          <Link
            to="/history"
            className="user-nav-item"
          >
            <span className="nav-icon">◷</span>
            <span>History</span>
          </Link>

          <Link
            to="/profile"
            className="user-nav-item"
          >
            <span className="nav-icon">○</span>
            <span>Profile</span>
          </Link>

        </nav>

        {/* Logout */}

        <button
          className="user-logout-button"
          onClick={handleLogout}
        >
          <span>↪</span>
          Logout
        </button>

      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="user-main">

        {/* Header */}

        <header className="user-header">

          <div>

            <h1>
              Good Morning, {userName}! 👋
            </h1>

            <p>
              Here's what's important today.
            </p>

          </div>

          {/* User Avatar */}

          <div
            className="user-avatar"
            title={userEmail}
          >
            {userName.charAt(0).toUpperCase()}
          </div>

        </header>

        {/* ================= DAILY HIGHLIGHTS ================= */}

        <section className="dashboard-section">

          <div className="section-header">

            <h2>
              Daily Knowledge Highlights
            </h2>

            <Link to="/highlights">
              View All
            </Link>

          </div>

          <div className="highlight-grid">

            {loading ? (

              <div className="dashboard-loading">
                Loading highlights...
              </div>

            ) : highlights.length === 0 ? (

              <div className="dashboard-empty">
                No highlights available.
              </div>

            ) : (

              highlights
                .slice(0, 3)
                .map((highlight, index) => (

                  <div
                    className="highlight-card"
                    key={highlight._id || index}
                  >

                    <div className="highlight-top">

                      <div
                        className={`highlight-icon ${
                          index % 3 === 0
                            ? "red"
                            : index % 3 === 1
                            ? "yellow"
                            : "purple"
                        }`}
                      >
                        {index % 3 === 0
                          ? "📄"
                          : index % 3 === 1
                          ? "📚"
                          : "☁"}
                      </div>

                      <span
                        className={`priority ${getPriorityClass(
                          highlight.priority
                        )}`}
                      >
                        {getPriorityText(
                          highlight.priority
                        )}
                      </span>

                    </div>

                    <span className="highlight-type">
                      Daily Highlight
                    </span>

                    <h3>
                      {highlight.title}
                    </h3>

                    {highlight.date && (
                      <small>
                        {highlight.date}
                      </small>
                    )}

                  </div>

                ))

            )}

          </div>

        </section>

        {/* ================= BOTTOM ================= */}

        <div className="dashboard-bottom">

          {/* ================= AI ASSISTANT ================= */}

          <section className="assistant-card">

            <h2>
              Ask Your Knowledge Assistant
            </h2>

            <p>
              Ask questions about your documents
              and get intelligent answers.
            </p>

            <div className="assistant-input">

              <input
                type="text"
                placeholder="Ask anything about your documents..."
              />

              <button
                onClick={() => navigate("/chat")}
              >
                ➜
              </button>

            </div>

          </section>

          {/* ================= QUICK STATS ================= */}

          <section className="quick-stats-card">

            <h2>
              Quick Stats
            </h2>

            <div className="stats-grid">

              {/* Documents */}

              <div className="stat-item">

                <strong>
                  {loading
                    ? "..."
                    : documents.length}
                </strong>

                <span>
                  Documents
                </span>

              </div>

              {/* Chats */}

              <div className="stat-item">

                <strong>
                  0
                </strong>

                <span>
                  Chats
                </span>

              </div>

              {/* Highlights */}

              <div className="stat-item">

                <strong>
                  {loading
                    ? "..."
                    : highlights.length}
                </strong>

                <span>
                  Highlights
                </span>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default UserDashboard;



