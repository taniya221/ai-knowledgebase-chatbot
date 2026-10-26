
import React, { useEffect, useState } from 'react';
import './ContactMessages.css';
import AdminSidebar from "../../components/AdminSidebar";
export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadMessages = async () => {
    try {
      setError('');

      const response = await fetch('http://localhost:5000/api/contact');

      if (!response.ok) {
        throw new Error('Unable to load contact messages.');
      }

      const result = await response.json();
      setMessages(result.messages || []);
    } catch (err) {
      setError(err.message || 'Unable to load contact messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setError('');

      const response = await fetch(
        `http://localhost:5000/api/contact/${id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to update status.');
      }

      setMessages((previous) =>
        previous.map((item) =>
          item._id === id ? result.message : item
        )
      );
    } catch (err) {
      setError(err.message || 'Unable to update status.');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this contact message? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setError('');
      setDeletingId(id);

      const response = await fetch(
        `http://localhost:5000/api/contact/${id}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || 'Unable to delete contact message.'
        );
      }

      setMessages((previous) =>
        previous.filter((item) => item._id !== id)
      );
    } catch (err) {
      setError(err.message || 'Unable to delete contact message.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <p>Loading contact messages...</p>;
  }


return (
  <div className="contact-messages-layout">
    <AdminSidebar />

    <main className="contact-messages-main">
      <div className="contact-messages-page">
        <h2>Contact Messages</h2>
       

        {error && (
          <p role="alert" className="contact-messages-error">
            {error}
          </p>
        )}

        {loading ? (
          <p>Loading contact messages...</p>
        ) : messages.length === 0 && !error ? (
          <p className="contact-messages-empty">
            No contact messages yet.
          </p>
        ) : (
          <div className="contact-messages-list">
            {messages.map((item) => (
              <article
                key={item._id}
                className="contact-message-card"
              >
                <div className="contact-message-header">
                  <h3>{item.name}</h3>
                  <span>{item.status}</span>
                </div>

                <p>
                  <strong>Email:</strong>{" "}
                  <a href={`mailto:${item.email}`}>
                    {item.email}
                  </a>
                </p>

                <p>{item.message}</p>

                <small>
                  Submitted:{" "}
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : "Date unavailable"}
                </small>

                <div className="contact-message-actions">
                  {item.status === "unread" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(item._id, "read")}
                    >
                      Mark as Read
                    </button>
                  )}

                  {item.status !== "resolved" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(item._id, "resolved")
                      }
                    >
                      Mark as Resolved
                    </button>
                  )}

                  {item.status !== "unread" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(item._id, "unread")
                      }
                    >
                      Mark as Unread
                    </button>
                  )}

                  <button
                    type="button"
                    className="delete-message-btn"
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId === item._id}
                  >
                    {deletingId === item._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  </div>
);

}
