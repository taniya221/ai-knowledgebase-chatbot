import React, { useState, useRef } from "react";
import {
  Settings,
  User,
  Palette,
  Bell,
  Shield,
  Database,
  Cloud,
  Server,
  Upload,
  Lock,
  ChevronRight,
  Save,
  X
} from "lucide-react";
import { useTheme } from "./ThemeContext";

import "./AdminSettings.css";

function AdminSettings() {
  const [activeTab, setActiveTab] = useState("General");
  const fileInputRef = useRef(null);

  const { theme, setTheme } = useTheme(); // Use global theme state

  const [statusMessage, setStatusMessage] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [settings, setSettings] = useState({
    appName: "InfoHub",
    tagline: "Your Intelligent Knowledge Assistant",
    description:
      "An AI-powered knowledge base that helps you find information from your documents, with source references and daily updates.",
    primaryColor: localStorage.getItem("app_color") || "purple",
    twoFactor: localStorage.getItem("app_2fa") === "true",
    logoUrl: null,
    backupStatus: "Idle",
    notifications: {
      document: true,
      highlight: true,
      user: false,
      system: true,
    }
  });

  const [profile, setProfile] = useState({
    name: "Admin",
    email: "admin@infohub.com",
  });

  const showNotificationBanner = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const toggleNotification = (name) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [name]: !settings.notifications[name],
      }
    });
    showNotificationBanner(`Notification preference updated.`);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setSettings({
        ...settings,
        logoUrl: previewUrl,
      });
      showNotificationBanner("Logo updated successfully!");
    }
  };

  const handleSave = (section) => {
    showNotificationBanner(`${section} settings saved successfully!`);
  };

  const handlePasswordUpdateSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert("Please fill in all password fields.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    showNotificationBanner("Admin password changed successfully!");
    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleBackupTrigger = () => {
    setSettings({ ...settings, backupStatus: "Backing up..." });
    setTimeout(() => {
      setSettings(prev => ({ ...prev, backupStatus: "Completed (Today)" }));
      showNotificationBanner("Database backup snapshot created successfully!");
    }, 2000);
  };

  const menuItems = [
    { name: "General", icon: Settings },
    { name: "Profile", icon: User },
    { name: "Appearance", icon: Palette },
    { name: "Notifications", icon: Bell },
    { name: "Security", icon: Shield },
    { name: "Database", icon: Database },
    { name: "Backup & Restore", icon: Cloud },
  ];

  const isDark = theme === "Dark";

  return (
    <div className="settings-page" style={{ minHeight: "100vh" }}>
      {statusMessage && (
        <div style={{
          background: "#4f46e5",
          color: "#fff",
          padding: "12px 20px",
          borderRadius: "8px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "500",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <span>{statusMessage}</span>
          <X size={18} style={{ cursor: "pointer" }} onClick={() => setStatusMessage(null)} />
        </div>
      )}

      <div className="settings-header">
        <div className="settings-title-box">
          <div className="settings-main-icon">
            <Settings size={30} />
          </div>
          <div>
            <h1>Settings</h1>
            <p>Manage your system preferences and application settings.</p>
          </div>
        </div>
      </div>

      <div className="settings-container">
        <div className="settings-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className={`settings-menu-item ${
                  activeTab === item.name ? "active" : ""
                }`}
                onClick={() => setActiveTab(item.name)}
              >
                <Icon size={20} />
                <span>{item.name}</span>
                {activeTab === item.name && (
                  <ChevronRight size={17} className="menu-arrow" />
                )}
              </button>
            );
          })}
        </div>

        <div className="settings-content">
          {activeTab === "General" && (
            <>
              <div className="settings-card general-card">
                <div className="card-header">
                  <div>
                    <h2>General Settings</h2>
                    <p>Update your application name, description and basic information.</p>
                  </div>
                </div>

                <div className="general-layout">
                  <div className="general-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Application Name</label>
                        <input
                          type="text"
                          name="appName"
                          value={settings.appName}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Tagline</label>
                        <input
                          type="text"
                          name="tagline"
                          value={settings.tagline}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={settings.description}
                        onChange={handleChange}
                        rows="5"
                      />
                    </div>
                  </div>

                  <div className="logo-section">
                    <div className="logo-preview">
                      <div className="logo-symbol">
                        {settings.logoUrl ? (
                          <img 
                            src={settings.logoUrl} 
                            alt="Logo Preview" 
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} 
                          />
                        ) : (
                          <Settings size={42} />
                        )}
                      </div>
                      <h3>{settings.appName}</h3>
                      
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleLogoUpload} 
                        accept="image/png, image/jpeg" 
                        style={{ display: "none" }} 
                      />
                      
                      <button className="change-logo" onClick={() => fileInputRef.current.click()}>
                        <Upload size={16} />
                        Change Logo
                      </button>
                      <p>Recommended size: 200×200px</p>
                      <small>PNG, JPG</small>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <button className="cancel-btn" onClick={() => showNotificationBanner("Changes discarded.")}>
                    <X size={17} />
                    Cancel
                  </button>
                  <button className="save-btn" onClick={() => handleSave("General")}>
                    <Save size={17} />
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="settings-grid">
                <div className="settings-card">
                  <div className="small-card-header">
                    <Server size={23} />
                    <div>
                      <h3>System Information</h3>
                      <p>View and manage system details.</p>
                    </div>
                  </div>
                  <div className="system-info">
                    <div>
                      <span>Current Version</span>
                      <strong>v1.0.0</strong>
                    </div>
                    <div>
                      <span>Database</span>
                      <strong>MongoDB Atlas</strong>
                    </div>
                    <div>
                      <span>Environment</span>
                      <strong>Development</strong>
                    </div>
                    <div>
                      <span>Last Updated</span>
                      <strong>Sep 15, 2026</strong>
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <div className="small-card-header">
                    <Palette size={23} />
                    <div>
                      <h3>Appearance</h3>
                      <p>Customize the look and feel of your dashboard.</p>
                    </div>
                  </div>
                  <div className="appearance-section">
                    <label>Theme</label>
                    <div className="theme-buttons">
                      {["Light", "Dark", "System"].map((item) => (
                        <button
                          key={item}
                          className={theme === item ? "selected" : ""}
                          onClick={() => {
                            setTheme(item);
                            showNotificationBanner(`Theme changed to ${item}`);
                          }}
                        >
                          {item}
                        </button>
                      ))}
                    </div>

                    <label>Primary Color</label>
                    <div className="color-options">
                      {["purple", "blue", "green", "orange", "pink"].map((color) => (
                        <span
                          key={color}
                          className={`color ${color} ${settings.primaryColor === color ? "active-ring" : ""}`}
                          onClick={() => {
                            setSettings({ ...settings, primaryColor: color });
                            localStorage.setItem("app_color", color);
                            showNotificationBanner(`Primary color updated`);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <div className="small-card-header">
                    <Bell size={23} />
                    <div>
                      <h3>Notifications</h3>
                      <p>Manage what notifications you want to receive.</p>
                    </div>
                  </div>
                  <div className="notification-list">
                    <NotificationRow
                      title="New document uploaded"
                      enabled={settings.notifications.document}
                      onClick={() => toggleNotification("document")}
                    />
                    <NotificationRow
                      title="New highlight added"
                      enabled={settings.notifications.highlight}
                      onClick={() => toggleNotification("highlight")}
                    />
                    <NotificationRow
                      title="New user registered"
                      enabled={settings.notifications.user}
                      onClick={() => toggleNotification("user")}
                    />
                    <NotificationRow
                      title="System updates"
                      enabled={settings.notifications.system}
                      onClick={() => toggleNotification("system")}
                    />
                  </div>
                </div>

                <div className="settings-card">
                  <div className="small-card-header">
                    <Shield size={23} />
                    <div>
                      <h3>Security</h3>
                      <p>Keep your account and data secure.</p>
                    </div>
                  </div>
                  <div className="security-list">
                    <div className="security-row">
                      <div>
                        <span>Change Admin Password</span>
                      </div>
                      <button className="outline-btn" onClick={() => setShowPasswordModal(true)}>
                        <Lock size={15} />
                        Update Password
                      </button>
                    </div>

                    <div className="security-row">
                      <div>
                        <span>Two-Factor Authentication</span>
                      </div>
                      <div className="two-factor" onClick={() => {
                        const newVal = !settings.twoFactor;
                        setSettings({ ...settings, twoFactor: newVal });
                        localStorage.setItem("app_2fa", newVal);
                        showNotificationBanner(`2FA is now ${newVal ? "Enabled" : "Disabled"}`);
                      }} style={{ cursor: 'pointer' }}>
                        <span>{settings.twoFactor ? "Enabled" : "Disabled"}</span>
                        <div className={`toggle ${settings.twoFactor ? "on" : "disabled"}`}>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "Profile" && (
            <div className="settings-card full-card">
              <div className="card-header">
                <h2>Admin Profile</h2>
                <p>Manage your administrator account information.</p>
              </div>

              <div className="profile-avatar">
                {profile.name ? profile.name.charAt(0).toUpperCase() : "A"}
              </div>

              <div className="form-group">
                <label>Admin Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                />
              </div>

              <button className="save-btn" onClick={() => handleSave("Profile")}>
                <Save size={17} />
                Save Profile
              </button>
            </div>
          )}

          {activeTab === "Appearance" && (
            <div className="settings-card full-card">
              <div className="card-header">
                <h2>Appearance Settings</h2>
                <p>Customize the appearance of your admin dashboard.</p>
              </div>

              <h3 className="section-title">Theme</h3>
              <div className="theme-large">
                {["Light", "Dark", "System"].map((item) => (
                  <button
                    key={item}
                    className={theme === item ? "selected" : ""}
                    onClick={() => {
                      setTheme(item);
                      showNotificationBanner(`Theme set to ${item}`);
                    }}
                  >
                    <Palette size={22} />
                    {item}
                  </button>
                ))}
              </div>

              <h3 className="section-title" style={{ marginTop: "2rem" }}>Primary Accent Color</h3>
              <div className="color-options" style={{ display: "flex", gap: "12px" }}>
                {["purple", "blue", "green", "orange", "pink"].map((color) => (
                  <span
                    key={color}
                    className={`color ${color} ${settings.primaryColor === color ? "active-ring" : ""}`}
                    onClick={() => {
                      setSettings({ ...settings, primaryColor: color });
                      localStorage.setItem("app_color", color);
                      showNotificationBanner(`Accent color changed`);
                    }}
                    style={{ width: "35px", height: "35px", borderRadius: "50%", cursor: "pointer", display: "inline-block" }}
                  />
                ))}
              </div>

              <div style={{ marginTop: "2rem" }}>
                <button className="save-btn" onClick={() => handleSave("Appearance")}>
                  <Save size={17} />
                  Save Appearance
                </button>
              </div>
            </div>
          )}

          {activeTab === "Notifications" && (
            <div className="settings-card full-card">
              <div className="card-header">
                <h2>Notification Settings</h2>
                <p>Choose which system notifications you receive.</p>
              </div>

              <div className="large-notifications">
                <NotificationRow
                  title="New document uploaded"
                  enabled={settings.notifications.document}
                  onClick={() => toggleNotification("document")}
                />
                <NotificationRow
                  title="New highlight added"
                  enabled={settings.notifications.highlight}
                  onClick={() => toggleNotification("highlight")}
                />
                <NotificationRow
                  title="New user registered"
                  enabled={settings.notifications.user}
                  onClick={() => toggleNotification("user")}
                />
                <NotificationRow
                  title="System updates"
                  enabled={settings.notifications.system}
                  onClick={() => toggleNotification("system")}
                />
              </div>

              <div style={{ marginTop: "2rem" }}>
                <button className="save-btn" onClick={() => handleSave("Notifications")}>
                  <Save size={17} />
                  Save Notifications
                </button>
              </div>
            </div>
          )}

          {activeTab === "Security" && (
            <div className="settings-card full-card">
              <div className="card-header">
                <h2>Security Settings</h2>
                <p>Manage your admin account security.</p>
              </div>

              <div className="security-big">
                <div>
                  <Lock size={25} />
                  <div>
                    <h3>Admin Password</h3>
                    <p>Change your administrator password.</p>
                  </div>
                </div>
                <button className="outline-btn" onClick={() => setShowPasswordModal(true)}>
                  Update Password
                </button>
              </div>

              <div className="security-big" style={{ marginTop: "1rem" }}>
                <div>
                  <Shield size={25} />
                  <div>
                    <h3>Two-Factor Authentication</h3>
                    <p>Add an extra layer of protection to your account.</p>
                  </div>
                </div>
                <div 
                  className={`toggle ${settings.twoFactor ? "on" : "disabled"}`} 
                  onClick={() => {
                    const newVal = !settings.twoFactor;
                    setSettings({ ...settings, twoFactor: newVal });
                    localStorage.setItem("app_2fa", newVal);
                    showNotificationBanner(`2FA is now ${newVal ? "Enabled" : "Disabled"}`);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <span></span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Database" && (
            <div className="settings-card full-card">
              <div className="card-header">
                <h2>Database</h2>
                <p>View your application database configuration.</p>
              </div>

              <div className="database-box">
                <Database size={35} />
                <h3>MongoDB Atlas</h3>
                <p>Your application is actively connected to MongoDB Atlas clusters.</p>
                <span className="connected">● Connected</span>
              </div>
            </div>
          )}

          {activeTab === "Backup & Restore" && (
            <div className="settings-card full-card">
              <div className="card-header">
                <h2>Backup & Restore</h2>
                <p>Backup and restore your data securely.</p>
              </div>

              <div className="backup-box">
                <Cloud size={40} />
                <h3>Database Backup</h3>
                <p>Create a backup snapshot of your documents, users, and system highlights.</p>
                <p style={{ fontSize: "13px", color: "#666", marginBottom: "15px" }}>Status: <strong>{settings.backupStatus}</strong></p>
                <button className="save-btn" onClick={handleBackupTrigger}>
                  Create Backup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPasswordModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: isDark ? "#1e1e1e" : "#fff",
            color: isDark ? "#fff" : "#000",
            padding: "30px",
            borderRadius: "12px",
            width: "400px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
          }}>
            <h3>Update Admin Password</h3>
            <form onSubmit={handlePasswordUpdateSubmit} style={{ marginTop: "15px" }}>
              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>New Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowPasswordModal(false)}
                  style={{ padding: "8px 16px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-btn"
                  style={{ padding: "8px 16px", cursor: "pointer" }}
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationRow({ title, enabled, onClick }) {
  return (
    <div className="notification-row">
      <span>{title}</span>
      <button
        type="button"
        className={`toggle ${enabled ? "on" : ""}`}
        onClick={onClick}
      >
        <span></span>
      </button>
    </div>
  );
}

export default AdminSettings;