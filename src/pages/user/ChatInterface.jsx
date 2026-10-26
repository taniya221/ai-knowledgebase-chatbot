import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ChatInterface.css";
import ReactMarkdown from "react-markdown";

export default function ChatInterface() {
  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [conversations, setConversations] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "Hello! Ask me anything based on the documents uploaded by the admin.",
    },
  ]);

  const [documents, setDocuments] = useState([]);
  const [input, setInput] = useState("");

  const [loadingDocs, setLoadingDocs] = useState(true);
  const [sending, setSending] = useState(false);

  // =====================================================
  // LOAD DATA WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {
    fetchDocuments();
    fetchConversations();
  }, []);

  // =====================================================
  // FETCH ADMIN DOCUMENTS
  // =====================================================

  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);

      const response = await fetch(
        "http://localhost:5000/api/documents"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setDocuments(data);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  // =====================================================
  // FETCH CHAT HISTORY
  // =====================================================

  const fetchConversations = async () => {
    try {
      console.log("Fetching conversations...");

      const response = await fetch(
        "http://localhost:5000/api/conversations"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();

      console.log("Conversations received:", data);

      if (Array.isArray(data)) {
        setConversations(data);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error(
        "Error fetching conversations:",
        error
      );

      setConversations([]);
    }
  };

  // =====================================================
  // LOAD ONE OLD CONVERSATION
  // =====================================================

  const loadConversation = async (chatId) => {
    try {
      console.log("Loading conversation:", chatId);

      const response = await fetch(
        `http://localhost:5000/api/conversations/${chatId}`
      );

      const data = await response.json();

      console.log("Conversation data:", data);

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load conversation"
        );
      }

      if (data.conversation) {
        setCurrentChatId(
          data.conversation.chatId
        );

        const loadedMessages =
          data.conversation.messages.map(
            (message) => ({
              sender: message.sender,
              text: message.text,
              source: message.source || null,
              time: message.time
                ? new Date(
                    message.time
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "",
            })
          );

        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error(
        "Load conversation error:",
        error
      );
    }
  };

  <button
  onClick={() => window.history.back()}
  className="sidebar-back-button"
>
  ← Back
</button>
  // =====================================================
  // SEND QUESTION
  // =====================================================

  const handleSend = async (e) => {
    e.preventDefault();

    if (!input.trim() || sending) {
      return;
    }

    const userQuestion = input.trim();

    setInput("");

    // Show user message immediately
    setMessages((previousMessages) => [
      ...previousMessages,
      {
        sender: "user",
        text: userQuestion,
        time: new Date().toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        ),
      },
    ]);

    setSending(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            question: userQuestion,
            chatId: currentChatId,
          }),
        }
      );

      const data = await response.json();

      console.log("Chat response:", data);

      // =================================================
      // SUCCESS
      // =================================================

      if (response.ok) {
        setMessages(
          (previousMessages) => [
            ...previousMessages,

            {
              sender: "bot",

              text:
                data.answer ||
                "I received your question.",

              source:
                data.source ||
                null,

              time: new Date().toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              ),
            },
          ]
        );

        // Save chat ID
        if (data.chatId) {
          setCurrentChatId(data.chatId);
        }

        // IMPORTANT:
        // Refresh sidebar so new chat appears
        await fetchConversations();
      }

      // =================================================
      // BACKEND ERROR
      // =================================================

      else {
        setMessages(
          (previousMessages) => [
            ...previousMessages,

            {
              sender: "bot",

              text:
                data.error ||
                "Sorry, I couldn't process your question right now.",
            },
          ]
        );
      }
    } catch (error) {
      console.error("Chat error:", error);

      setMessages(
        (previousMessages) => [
          ...previousMessages,

          {
            sender: "bot",
            text:
              "Network error connecting to the server.",
          },
        ]
      );
    } finally {
      setSending(false);
    }
  };

  // =====================================================
  // NEW CHAT
  // =====================================================

  const handleNewChat = () => {
    setCurrentChatId(null);

    setMessages([
      {
        sender: "bot",
        text:
          "Hello! Ask me anything based on the documents uploaded by the admin.",
      },
    ]);

    setInput("");
  };

  // =====================================================
  // CLEAR CURRENT CHAT
  // =====================================================

  const handleClearChat = async () => {
    // If there is no saved conversation
    if (!currentChatId) {
      setMessages([
        {
          sender: "bot",
          text:
            "Hello! Ask me anything based on the documents uploaded by the admin.",
        },
      ]);

      return;
    }

    try {
      console.log(
        "Deleting conversation:",
        currentChatId
      );

      const response = await fetch(
        `http://localhost:5000/api/conversations/${currentChatId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      console.log(
        "Delete response:",
        data
      );

      if (response.ok) {
        // Remove from sidebar
        setConversations(
          (previousConversations) =>
            previousConversations.filter(
              (conversation) =>
                conversation.chatId !==
                currentChatId
            )
        );

        // Reset current chat
        setCurrentChatId(null);

        // Reset messages
        setMessages([
          {
            sender: "bot",
            text:
              "Hello! Ask me anything based on the documents uploaded by the admin.",
          },
        ]);

        setInput("");
      } else {
        console.error(
          "Failed to delete conversation:",
          data.error
        );
      }
    } catch (error) {
      console.error(
        "Clear chat error:",
        error
      );
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="chat-layout">

      {/* =================================================
          LEFT SIDEBAR
      ================================================= */}

      <aside className="conversations-sidebar">

        <h3>
          Conversations
        </h3>

        <button
          className="new-chat-btn"
          onClick={handleNewChat}
        >
          + New Chat
        </button>

        <div className="conv-list">

          {conversations.length === 0 ? (

            <small
              style={{
                color: "#8792a7",
                padding: "10px",
                display: "block",
              }}
            >
              No chat history yet
            </small>

          ) : (

            conversations.map(
              (conversation) => (

                <div
                  key={
                    conversation.chatId
                  }

                  className={`conv-item ${
                    currentChatId ===
                    conversation.chatId
                      ? "active"
                      : ""
                  }`}

                  onClick={() =>
                    loadConversation(
                      conversation.chatId
                    )
                  }
                >

                  <span>
                    {conversation.title ||
                      "Untitled Chat"}
                  </span>

                </div>

              )
            )

          )}

        </div>

        <button
          className="view-all-btn"
          onClick={() =>
            navigate(
              "/user-dashboard"
            )
          }
          style={{
            marginTop: "auto",
          }}
        >
          Back to Dashboard
        </button>

      </aside>
      
      


      {/* =================================================
          MAIN CHAT
      ================================================= */}

      <main className="chat-main">

        

        {/* Header */}

        <header className="chat-header">

          <h3>
            Knowledge Assistant
          </h3>

          <button
            className="clear-btn"
            onClick={handleClearChat}
          >
            Clear Chat
          </button>

        </header>


        {/* Messages */}

        <div className="chat-messages">

          {messages.map(
            (message, index) => (

              <div
                key={index}
                className={`message-row ${message.sender}`}
              >

                {/* Bot Avatar */}

                {message.sender ===
                  "bot" && (
                  <div className="bot-avatar">
                    🤖
                  </div>
                )}


{/* Message */}

<div
  className={`message-bubble ${message.sender}`}
>
  {message.sender === "bot" ? (
    <ReactMarkdown>
      {message.text || ""}
    </ReactMarkdown>
  ) : (
    <p>{message.text}</p>
  )}

  {/* Time */}

  {message.time && (
    <span className="time">
      {message.time}
    </span>
  )}

  {/* Source */}

  {message.source && (
    <div className="source-tag">
      Source:{" "}
      {message.source}
    </div>
  )}
</div>

              </div>

            )
          )}


          {/* Thinking */}

          {sending && (
            <div className="message-row bot">

              <div className="bot-avatar">
                🤖
              </div>

              <div className="message-bubble bot">
                <ReactMarkdown>Thinking...</ReactMarkdown>
              </div>

            </div>
          )}

        </div>


        {/* Input */}

        <form
          className="chat-input-form"
          onSubmit={handleSend}
        >

          <input
            type="text"
            placeholder="Ask anything about your documents..."
            value={input}
            onChange={(e) =>
              setInput(
                e.target.value
              )
            }
            disabled={sending}
          />

          <button
            type="submit"
            className="send-btn"
            disabled={
              sending ||
              !input.trim()
            }
          >
            ➔
          </button>

        </form>

      </main>


      {/* =================================================
          RIGHT SIDEBAR
      ================================================= */}

      <aside className="sources-sidebar">

        <h3>
          Uploaded Documents
        </h3>


        <div className="sources-list">

          {loadingDocs ? (

            <small
              style={{
                color: "#8792a7",
              }}
            >
              Loading documents...
            </small>

          ) : documents.length === 0 ? (

            <small
              style={{
                color: "#8792a7",
              }}
            >
              No documents uploaded
              by admin yet.
            </small>

          ) : (

            documents.map(
              (document, index) => (

                <div
                  className="source-card"
                  key={
                    document._id ||
                    index
                  }
                >

                  <div className="file-icon red">
                    📄
                  </div>

                  <div className="file-info">

                    <strong>
                      {document.name ||
                        document.title ||
                        "Document"}
                    </strong>

                    <small>
                      {document.type ||
                        "Admin Upload"}
                    </small>

                  </div>

                </div>

              )
            )

          )}
          

        </div>
        


        {/* View all */}

        <button
          className="view-all-btn"
          onClick={() =>
            navigate(
              "/documents"
            )
          }
        >
          View All Documents
        </button>

      </aside>

    </div>
  );
}

