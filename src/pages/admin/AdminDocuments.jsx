import React, { useState, useRef, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import "./AdminDocuments.css";

function AdminDocuments() {
  const fileInputRef = useRef(null);
  const [documentsList, setDocumentsList] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/documents")
      .then((res) => res.json())
      .then((data) => setDocumentsList(data))
      .catch((err) => console.error("Error fetching documents:", err));
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:5000/api/documents", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Upload failed");
        }
        setDocumentsList(result);
      } catch (err) {
        console.error("Error uploading file:", err);
        alert(`Upload failed: ${err.message}`);
      }
    }
    event.target.value = null;
  };

  const handleView = (doc) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, "_blank");
    } else {
      alert("File preview not available.");
    }
  };

  const handleEdit = async (id, currentName) => {
    const newName = prompt("Enter new document name:", currentName);
    if (newName && newName.trim() !== "") {
      alert("Rename feature can be mapped to a backend PUT request.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/documents/${id}`, {
        method: "DELETE",
      });
      const updatedList = await response.json();
      setDocumentsList(updatedList);
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="topbar">
          <div>
            <h1>Documents</h1>
            <p>Manage all uploaded documents</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <button className="upload-btn" onClick={handleUploadClick}>
            + Upload Document
          </button>
        </div>

        <div className="table-container">
          <table className="documents-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Type</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documentsList.length > 0 ? (
                documentsList.map((doc) => (
                  <tr key={doc._id}>
                    <td>
                      <div className="doc-name-cell">
                        <span className="file-icon">📕</span>
                        <span className="file-title">{doc.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="type-badge">{doc.type}</span>
                    </td>
                    <td>
                      <span className="uploader-badge">{doc.uploadedBy}</span>
                    </td>
                    <td className="date-text">{doc.date}</td>
                    <td>
                      <div className="actions-cell">
                        <button title="View" className="action-btn" onClick={() => handleView(doc)}>👁️</button>
                        <button title="Edit" className="action-btn" onClick={() => handleEdit(doc._id, doc.name)}>✏️</button>
                        <button title="Delete" className="action-btn" onClick={() => handleDelete(doc._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#6b7280" }}>
                    No documents uploaded yet. Click "+ Upload Document" to add files.
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