import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Highlights.css";

function Highlights() {
  const navigate = useNavigate();

  const [highlights, setHighlights] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHighlights();
  }, []);

  const fetchHighlights = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/highlights"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch highlights");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setHighlights(data);
      } else if (Array.isArray(data.highlights)) {
        setHighlights(data.highlights);
      } else {
        setHighlights([]);
      }
    } catch (error) {
      console.error("Error loading highlights:", error);
      setHighlights([]);
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

  // ================= SEARCH =================

  const filteredHighlights = highlights.filter((highlight) => {
    const title = highlight.title || "";
    const description = highlight.description || "";
    const priority = highlight.priority || "";

    const searchText = search.toLowerCase();

    return (
      title.toLowerCase().includes(searchText) ||
      description.toLowerCase().includes(searchText) ||
      priority.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="highlights-page">

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
            className="user-nav-item active"
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
            className="user-nav-item"
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

      <main className="highlights-main">

        {/* HEADER */}

        <header className="highlights-header">

          <div>
            <h1>Highlights</h1>

            <p>
              Important knowledge and updates for you
            </p>
          </div>

          <div className="highlights-count">
            {highlights.length} Highlights
          </div>

        </header>

        {/* SEARCH */}

        <div className="highlights-search-container">

          <span className="search-icon">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search highlights..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        {/* HIGHLIGHTS CARD */}

        <section className="highlights-card">

          <div className="highlights-card-header">

            <h2>
              Daily Knowledge Highlights
            </h2>

            <span>
              {filteredHighlights.length} result
              {filteredHighlights.length !== 1
                ? "s"
                : ""}
            </span>

          </div>

          {loading ? (

            <div className="highlights-message">
              Loading highlights...
            </div>

          ) : filteredHighlights.length === 0 ? (

            <div className="highlights-message">

              {search
                ? "No highlights found matching your search."
                : "No highlights available."}

            </div>

          ) : (

            <div className="highlights-grid">

              {filteredHighlights.map(
                (highlight, index) => (

                  <div
                    className="user-highlight-card"
                    key={
                      highlight._id || index
                    }
                  >

                    <div className="user-highlight-top">

                      <div
                        className={`user-highlight-icon ${
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
                        className={`highlight-priority ${getPriorityClass(
                          highlight.priority
                        )}`}
                      >
                        {getPriorityText(
                          highlight.priority
                        )}
                      </span>

                    </div>

                    <span className="user-highlight-type">
                      Daily Highlight
                    </span>

                    <h3>
                      {highlight.title ||
                        "Untitled Highlight"}
                    </h3>

                    {highlight.description && (
                      <p>
                        {highlight.description}
                      </p>
                    )}

                    {highlight.date && (
                      <small>
                        {highlight.date}
                      </small>
                    )}

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default Highlights;