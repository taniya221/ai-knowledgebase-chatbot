import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Documents.css";

function Documents() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch documents from backend
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/documents"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setDocuments(data);
      } else if (Array.isArray(data.documents)) {
        setDocuments(data.documents);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Get document type
  const getFileType = (document) => {
    if (document.type) {
      return document.type.toUpperCase();
    }

    if (document.mimeType) {
      if (document.mimeType.includes("pdf")) {
        return "PDF";
      }

      if (
        document.mimeType.includes("presentation") ||
        document.mimeType.includes("pptx")
      ) {
        return "PPTX";
      }

      if (document.mimeType.includes("text")) {
        return "TXT";
      }
    }

    if (document.name) {
      const extension = document.name
        .split(".")
        .pop()
        .toUpperCase();

      return extension;
    }

    return "FILE";
  };

  // Get document icon
  const getFileIcon = (document) => {
    const type = getFileType(document);

    if (type === "PDF") {
      return "📕";
    }

    if (type === "PPTX" || type === "PPT") {
      return "📊";
    }

    if (type === "TXT") {
      return "📄";
    }

    return "📁";
  };

  // Format date
  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // Get uploaded by
  const getUploadedBy = (document) => {
    if (document.uploadedBy) {
      if (typeof document.uploadedBy === "object") {
        return (
          document.uploadedBy.name ||
          document.uploadedBy.email ||
          "Admin"
        );
      }

      return document.uploadedBy;
    }

    return "Admin";
  };

  // Open document
  const openDocument = (document) => {
    if (!document.fileUrl) {
      alert("Document file is not available.");
      return;
    }

    let fileUrl = document.fileUrl;

    if (fileUrl.startsWith("/")) {
      fileUrl = `http://localhost:5000${fileUrl}`;
    }

    window.open(fileUrl, "_blank");
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    navigate("/login");
  };

  // Search documents
  const filteredDocuments = documents.filter((document) => {
    const documentName = document.name || "";

    return documentName
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  return (
    <div className="documents-page">

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

          {/* Home */}

          <Link
            to="/user/dashboard"
            className="user-nav-item"
          >
            <span className="nav-icon">⌂</span>
            <span>Home</span>
          </Link>

          {/* AI Chat */}

          <Link
            to="/user/chat"
            className="user-nav-item"
          >
            <span className="nav-icon">◉</span>
            <span>AI Chat</span>
          </Link>

          {/* Documents */}

          <Link
            to="/user/documents"
            className="user-nav-item active"
          >
            <span className="nav-icon">▣</span>
            <span>Documents</span>
          </Link>

          {/* Highlights */}

          <Link
            to="/user/highlights"
            className="user-nav-item"
          >
            <span className="nav-icon">✦</span>
            <span>Highlights</span>
          </Link>

          {/* History */}

          <Link
            to="/user/history"
            className="user-nav-item"
          >
            <span className="nav-icon">◷</span>
            <span>History</span>
          </Link>

          {/* Profile */}

          <Link
            to="/user/profile"
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

      {/* ================= DOCUMENTS CONTENT ================= */}

      <main className="documents-main">

        {/* Header */}

        <header className="documents-header">

          <div>
            <h1>Documents</h1>

            <p>
              Manage and explore your knowledge base
            </p>
          </div>

          <div className="documents-count">
            {documents.length} Documents
          </div>

        </header>

        {/* Search */}

        <div className="documents-search-container">

          <span className="search-icon">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        {/* Documents Card */}

        <section className="documents-card">

          <div className="documents-card-header">

            <h2>
              Knowledge Base Documents
            </h2>

            <span>
              {filteredDocuments.length} result
              {filteredDocuments.length !== 1
                ? "s"
                : ""}
            </span>

          </div>

          {/* Loading */}

          {loading ? (

            <div className="documents-message">
              Loading documents...
            </div>

          ) : filteredDocuments.length === 0 ? (

            /* Empty */

            <div className="documents-message">

              {search
                ? "No documents found matching your search."
                : "No documents available."}

            </div>

          ) : (

            /* Table */

            <div className="documents-table-wrapper">

              <table className="documents-table">

                <thead>

                  <tr>

                    <th>
                      Document Name
                    </th>

                    <th>
                      Type
                    </th>

                    <th>
                      Uploaded By
                    </th>

                    <th>
                      Upload Date
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredDocuments.map(
                    (document, index) => (

                      <tr
                        key={
                          document._id || index
                        }
                      >

                        {/* Document Name */}

                        <td>

                          <div className="document-name-cell">

                            <div className="document-icon">
                              {getFileIcon(document)}
                            </div>

                            <div>

                              <strong>
                                {document.name ||
                                  "Untitled Document"}
                              </strong>

                              <small>
                                Knowledge Base
                              </small>

                            </div>

                          </div>

                        </td>

                        {/* Type */}

                        <td>

                          <span className="document-type">
                            {getFileType(document)}
                          </span>

                        </td>

                        {/* Uploaded By */}

                        <td>

                          <span className="uploaded-by">
                            {getUploadedBy(document)}
                          </span>

                        </td>

                        {/* Date */}

                        <td>

                          <span className="upload-date">
                            {formatDate(
                              document.date ||
                              document.createdAt
                            )}
                          </span>

                        </td>

                        {/* View */}

                        <td>

                          <button
                            className="view-document-button"
                            onClick={() =>
                              openDocument(document)
                            }
                          >
                            👁 View
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default Documents;