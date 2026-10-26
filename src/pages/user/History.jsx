
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./History.css";

function History() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const userEmail = localStorage.getItem("email") || "";

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/conversations?email=${encodeURIComponent(
          userEmail
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setHistory(data);
      } else if (Array.isArray(data.conversations)) {
        setHistory(data.conversations);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Error loading history:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    navigate("/login");
  };

  const formatDate = (date) => {
    if (!date) return "";

    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return date;
    }

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";

    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return "";
    }

    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getQuestion = (conversation) => {
    return (
      conversation.question ||
      conversation.message ||
      conversation.query ||
      conversation.title ||
      "AI Chat Conversation"
    );
  };

  const filteredHistory = history.filter((conversation) => {
    const question = getQuestion(conversation).toLowerCase();

    const answer = (
      conversation.answer ||
      conversation.response ||
      ""
    ).toLowerCase();

    const searchText = search.toLowerCase();

    return (
      question.includes(searchText) ||
      answer.includes(searchText)
    );
  });

  const openConversation = (conversation) => {
    localStorage.setItem(
      "selectedConversation",
      JSON.stringify(conversation)
    );

    navigate("/user/chat");
  };

  return (
    <div className="history-page">

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
            className="user-nav-item active"
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

      <main className="history-main">

        <header className="history-header">

          <div>
            <h1>Chat History</h1>

            <p>
              View your previous conversations with InfoHub AI
            </p>
          </div>

          <div className="history-count">
            {history.length} Conversations
          </div>

        </header>

        {/* ================= SEARCH ================= */}

        <div className="history-search-container">

          <span className="history-search-icon">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search your conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        {/* ================= HISTORY CARD ================= */}

        <section className="history-card">

          <div className="history-card-header">

            <h2>Recent Conversations</h2>

            <span>
              {filteredHistory.length} result
              {filteredHistory.length !== 1
                ? "s"
                : ""}
            </span>

          </div>

          {loading ? (

            <div className="history-message">
              Loading chat history...
            </div>

          ) : filteredHistory.length === 0 ? (

            <div className="history-message">

              {search
                ? "No conversations found matching your search."
                : "No chat history available yet."}

            </div>

          ) : (

            <div className="history-list">

              {filteredHistory.map(
                (conversation, index) => (

                  <div
                    className="history-item"
                    key={
                      conversation._id || index
                    }
                    onClick={() =>
                      openConversation(conversation)
                    }
                  >

                    <div className="history-icon">
                      ◉
                    </div>

                    <div className="history-content">

                      <h3>
                        {getQuestion(conversation)}
                      </h3>

                      {(
                        conversation.answer ||
                        conversation.response
                      ) && (
                        <p>
                          {conversation.answer ||
                            conversation.response}
                        </p>
                      )}

                      <div className="history-meta">

                        <span>
                          {formatDate(
                            conversation.createdAt ||
                            conversation.date
                          )}
                        </span>

                        <span>•</span>

                        <span>
                          {formatTime(
                            conversation.createdAt ||
                            conversation.date
                          )}
                        </span>

                      </div>

                    </div>

                    <div className="history-arrow">
                      →
                    </div>

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

export default History;