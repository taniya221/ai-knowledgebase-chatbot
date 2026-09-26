
import React, { useState, useRef, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import "./AdminDocuments.css";

function AdminDocuments() {
  const fileInputRef = useRef(null);

  const [documentsList, setDocumentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // =====================================================
  // FETCH DOCUMENTS
  // =====================================================

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

      console.log("Documents received:", data);

      if (Array.isArray(data)) {
        setDocumentsList(data);
      } else {
        console.error(
          "Expected documents array but received:",
          data
        );

        setDocumentsList([]);
      }
    } catch (err) {
      console.error(
        "Error fetching documents:",
        err
      );

      setDocumentsList([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD DOCUMENTS WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {
    fetchDocuments();
  }, []);

  // =====================================================
  // OPEN FILE SELECTOR
  // =====================================================

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // =====================================================
  // UPLOAD DOCUMENT
  // =====================================================

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    console.log("Uploading:", file.name);

    const formData = new FormData();

    formData.append("file", file);

    try {
      setUploading(true);

      const response = await fetch(
        "http://localhost:5000/api/documents",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      console.log(
        "Upload response:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result.error ||
            result.message ||
            "Upload failed"
        );
      }

      // -----------------------------------------------
      // IMPORTANT:
      // Do NOT use setDocumentsList(result)
      //
      // Backend returns:
      // {
      //   message,
      //   document,
      //   textExtracted,
      //   textLength
      // }
      //
      // Instead, fetch the complete document list.
      // -----------------------------------------------

      await fetchDocuments();

      alert(
        `${file.name} uploaded successfully!`
      );
    } catch (err) {
      console.error(
        "Error uploading file:",
        err
      );

      alert(
        `Upload failed: ${err.message}`
      );
    } finally {
      setUploading(false);

      // Clear file input so the same file
      // can be selected again if needed.
      event.target.value = "";
    }
  };

  // =====================================================
  // VIEW DOCUMENT
  // =====================================================

  const handleView = (doc) => {
    if (!doc.fileUrl) {
      alert(
        "File preview not available."
      );

      return;
    }

    const fileUrl =
      `http://localhost:5000${doc.fileUrl}`;

    window.open(
      fileUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =====================================================
  // EDIT DOCUMENT
  // =====================================================

  const handleEdit = async (
    id,
    currentName
  ) => {
    const newName = prompt(
      "Enter new document name:",
      currentName
    );

    if (
      newName &&
      newName.trim() !== ""
    ) {
      alert(
        "Rename feature can be mapped to a backend PUT request."
      );
    }
  };

  // =====================================================
  // DELETE DOCUMENT
  // =====================================================

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this document?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/documents/${id}`,
        {
          method: "DELETE",
        }
      );

      const result =
        await response.json();

      console.log(
        "Delete response:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result.error ||
            result.message ||
            "Delete failed"
        );
      }

      // Fetch the updated list
      await fetchDocuments();

      alert(
        "Document deleted successfully."
      );
    } catch (err) {
      console.error(
        "Error deleting document:",
        err
      );

      alert(
        `Delete failed: ${err.message}`
      );
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-main">

        {/* ================= TOP BAR ================= */}

        <div className="topbar">
          <div>
            <h1>Documents</h1>

            <p>
              Manage all uploaded documents
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            style={{
              display: "none",
            }}
            accept=".pdf,.pptx,.txt"
            onChange={
              handleFileChange
            }
          />

          <button
            className="upload-btn"
            onClick={
              handleUploadClick
            }
            disabled={uploading}
          >
            {uploading
              ? "Uploading..."
              : "+ Upload Document"}
          </button>
        </div>

        {/* ================= TABLE ================= */}

        <div className="table-container">

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
                  Date
                </th>

                <th>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

              {/* ================= LOADING ================= */}

              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "30px",
                      color:
                        "#6b7280",
                    }}
                  >
                    Loading documents...
                  </td>
                </tr>
              ) : documentsList.length >
                0 ? (

                /* ================= DOCUMENT LIST ================= */

                documentsList.map(
                  (doc) => (
                    <tr
                      key={
                        doc._id
                      }
                    >

                      {/* DOCUMENT NAME */}

                      <td>
                        <div className="doc-name-cell">

                          <span className="file-icon">
                            {doc.type ===
                            "PDF"
                              ? "📕"
                              : doc.type ===
                                "PPTX"
                              ? "📊"
                              : "📄"}
                          </span>

                          <span className="file-title">
                            {doc.name ||
                              "Unnamed Document"}
                          </span>

                        </div>
                      </td>

                      {/* TYPE */}

                      <td>
                        <span className="type-badge">
                          {doc.type ||
                            "FILE"}
                        </span>
                      </td>

                      {/* UPLOADED BY */}

                      <td>
                        <span className="uploader-badge">
                          {doc.uploadedBy ||
                            "Admin"}
                        </span>
                      </td>

                      {/* DATE */}

                      <td className="date-text">
                        {doc.date ||
                          "N/A"}
                      </td>

                      {/* ACTIONS */}

                      <td>
                        <div className="actions-cell">

                          {/* VIEW */}

                          <button
                            title="View"
                            className="action-btn"
                            onClick={() =>
                              handleView(
                                doc
                              )
                            }
                          >
                            👁️
                          </button>

                          {/* EDIT */}

                          <button
                            title="Edit"
                            className="action-btn"
                            onClick={() =>
                              handleEdit(
                                doc._id,
                                doc.name
                              )
                            }
                          >
                            ✏️
                          </button>

                          {/* DELETE */}

                          <button
                            title="Delete"
                            className="action-btn"
                            onClick={() =>
                              handleDelete(
                                doc._id
                              )
                            }
                          >
                            🗑️
                          </button>

                        </div>
                      </td>

                    </tr>
                  )
                )

              ) : (

                /* ================= EMPTY ================= */

                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "30px",
                      color:
                        "#6b7280",
                    }}
                  >
                    No documents uploaded
                    yet. Click
                    "+ Upload Document"
                    to add files.
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

export default AdminDocuments;

