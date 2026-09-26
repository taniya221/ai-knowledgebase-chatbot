import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="landing-container">
      {/* Navbar Header */}
      <nav className="navbar">
        <Link to="/" className="brand">
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04" />
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04" />
            </svg>
          </div>
          InfoHub
        </Link>

        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#about">About Us</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>

        <div className="nav-actions">
          <Link to="/login" className="btn btn-login">Login</Link>
          <Link to="/signup" className="btn btn-signup">Sign Up</Link>
        </div>
      </nav>

      {/* Main Hero Section */}
      <section id="home" className="hero-wrapper">
        <div className="hero-left">
          <h1>Your Intelligent<br /><span>Knowledge Assistant</span></h1>
          <p>Ask questions. Get answers. Discover insights from your knowledge base.</p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-hero-primary">Get Started</Link>
            <a href="#about" className="btn btn-hero-secondary">Learn More</a>
          </div>
        </div>

        <div className="hero-right">
          <div className="glow-bg"></div>
          <div className="window-card">
            <div className="bot-container">
              <div className="bot-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="10" rx="2"/>
                  <circle cx="12" cy="5" r="2"/>
                  <path d="M12 7v4"/>
                  <line x1="8" y1="16" x2="8" y2="16"/>
                  <line x1="16" y1="16" x2="16" y2="16"/>
                </svg>
              </div>
            </div>

            <div className="lines-group">
              <div className="line line-short"></div>
              <div className="line line-mid"></div>
              <div className="line line-full"></div>
              <div className="line line-mid"></div>
            </div>

            <div className="bottom-bars">
              <div className="bar"></div>
              <div className="bar active"></div>
            </div>
          </div>

          <div className="plant-icon">
            <svg width="40" height="45" viewBox="0 0 45 55" fill="none">
              <path d="M15 35 C 10 20, 0 20, 5 10 C 15 15, 18 25, 18 35 Z" fill="#60a5fa"/>
              <path d="M22 35 C 20 15, 30 10, 35 15 C 32 25, 26 30, 22 35 Z" fill="#3b82f6"/>
              <path d="M15 35 L 30 35 L 26 52 L 19 52 Z" fill="#818cf8"/>
            </svg>
          </div>

          <div className="cup-icon">
            <svg width="28" height="32" viewBox="0 0 30 35" fill="none">
              <rect x="5" y="10" width="18" height="20" rx="4" fill="#6366f1"/>
              <path d="M23 15 H 26 A 3 3 0 0 1 29 18 V 20 A 3 3 0 0 1 26 23 H 23" stroke="#6366f1" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <div id="features" className="features-wrapper">
        <div className="cards-grid">
          <div className="card-item">
            <div className="card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3>AI Chat Assistant</h3>
            <p>Get accurate answers from your documents using AI.</p>
          </div>

          <div className="card-item">
            <div className="card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <h3>Knowledge Base</h3>
            <p>Upload and manage documents in one secure place.</p>
          </div>

          <div className="card-item">
            <div className="card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
            <h3>Daily Highlights</h3>
            <p>Get important updates and summaries every day.</p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section id="about" className="section-container">
        <h2 className="section-title">About InfoHub</h2>
        <p className="section-subtitle">Empowering teams and students with natural language document retrieval</p>
        
        <div className="about-grid">
          <div className="about-card">
            <p>
              InfoHub is an AI-powered knowledge assistant that helps students and teams quickly find information from documents. Instead of reading long PDFs, reports, or circulars, users can simply ask questions in normal language and get clear and accurate answers.
            </p>
          </div>
          <div className="about-card">
            <p>
              InfoHub uses AI, vector search, and RAG technology to understand documents and find the most relevant information. It also provides daily highlights so users can easily see important announcements and updates without missing them.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-container contact-section">
        <h2 className="section-title">Contact Us</h2>
        <p className="section-subtitle">Have questions? Send us a message directly.</p>

        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Enter your full name" required />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="Enter your email" required />
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea placeholder="Write your message here..." rows="5" required></textarea>
          </div>

          <button type="submit" className="btn-send-message">Send Message</button>
        </form>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 InfoHub Knowledge Assistant. All rights reserved.</p>
      </footer>
    </div>
  );
}