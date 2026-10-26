import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { useTheme } from "./ThemeContext";
import "./AdminSettings.css";

function AdminSettings() {

  // =====================================
  // GLOBAL THEME
  // =====================================

  const {
    theme,
    setTheme,
    primaryColor,
    setPrimaryColor
  } = useTheme();


  // =====================================
  // GENERAL SETTINGS
  // =====================================

  const [appName, setAppName] = useState(
    localStorage.getItem("appName") || "InfoHub"
  );

  const [email, setEmail] = useState(
    localStorage.getItem("systemEmail") ||
      "admin@infohub.com"
  );

  const [supportEmail, setSupportEmail] = useState(
    localStorage.getItem("supportEmail") ||
      "support@infohub.com"
  );

  const [timezone, setTimezone] = useState(
    localStorage.getItem("timezone") ||
      "Asia/Kolkata"
  );


  // =====================================
  // NOTIFICATIONS
  // =====================================

  const [newDocumentNotification, setNewDocumentNotification] =
    useState(
      localStorage.getItem("newDocumentNotification") !== "false"
    );

  const [userNotification, setUserNotification] =
    useState(
      localStorage.getItem("userNotification") !== "false"
    );

  const [systemNotification, setSystemNotification] =
    useState(
      localStorage.getItem("systemNotification") !== "false"
    );


// =====================================
// SAVE GENERAL SETTINGS
// =====================================

const handleGeneralSave = () => {
  localStorage.setItem("appName", appName);
  localStorage.setItem("systemEmail", email);
  localStorage.setItem("supportEmail", supportEmail);
  localStorage.setItem("timezone", timezone);

  // Update the application name in the sidebar
  window.dispatchEvent(new Event("appNameUpdated"));

  alert("General settings updated successfully!");
};

  // =====================================
  // SAVE THEME SETTINGS
  // =====================================

  const handleThemeSave = () => {

    // Theme and primary color are already
    // updated immediately through ThemeContext.

    localStorage.setItem(
      "app_theme",
      theme
    );

    localStorage.setItem(
      "app_color",
      primaryColor
    );

    alert(
      "Theme settings updated successfully!"
    );
  };


  // =====================================
  // NOTIFICATION 1
  // =====================================

  const saveNotificationSettings = async (documentValue, userValue, systemValue) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/notification-settings",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newDocumentNotification: documentValue,
            userNotification: userValue,
            systemNotification: systemValue,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save notification settings");
      }

      console.log("Notification settings saved successfully");
    } catch (error) {
      console.error("Error saving notification settings:", error);
      alert("Failed to save notification settings. Please try again.");
    }
  };

  const toggleDocumentNotification = () => {
    const newValue = !newDocumentNotification;
    setNewDocumentNotification(newValue);
    localStorage.setItem("newDocumentNotification", String(newValue));

    saveNotificationSettings(
      newValue,
      userNotification,
      systemNotification
    );
  };

  const toggleUserNotification = () => {
    const newValue = !userNotification;
    setUserNotification(newValue);
    localStorage.setItem("userNotification", String(newValue));

    saveNotificationSettings(
      newDocumentNotification,
      newValue,
      systemNotification
    );
  };

  const toggleSystemNotification = () => {
  const newValue = !systemNotification;
  setSystemNotification(newValue);
  localStorage.setItem("systemNotification", String(newValue));

  saveNotificationSettings(
    newDocumentNotification,
    userNotification,
    newValue
  );
};

// =====================================
// CREATE SYSTEM UPDATE NOTIFICATION
// =====================================

const createSystemUpdate = async () => {
  try {
    // Get the latest saved setting from the backend
    const settingsResponse = await fetch(
      "http://localhost:5000/api/notification-settings"
    );

    if (!settingsResponse.ok) {
      throw new Error("Could not load notification settings");
    }

    const settings = await settingsResponse.json();

    if (settings.systemNotification === false) {
      alert("System Updates are OFF. No notification was created.");
      return;
    }

    const response = await fetch(
      "http://localhost:5000/api/notifications/system-update",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "InfoHub System Update",
          message:
            "InfoHub has received a system update. Check out the latest improvements!",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create notification");
    }

    if (data.created) {
      alert("System update notification created successfully!");
      window.dispatchEvent(new Event("notificationsUpdated"));
    } else {
      alert(data.message || "Notification was not created.");
    }
  } catch (error) {
    console.error("System update error:", error);
    alert("Failed to create system update notification. Check the backend server.");
  }
};



  // =====================================
  // RETURN
  // =====================================

  return (

    <div className="admin-settings-page">

      {/* =================================
          SIDEBAR
      ================================= */}

      <AdminSidebar />


      {/* =================================
          MAIN CONTENT
      ================================= */}

      <main className="admin-settings-main">


        {/* =================================
            HEADER
        ================================= */}

        <div className="settings-header">

          <div className="settings-title-icon">
            ⚙
          </div>

          <div>

            <h1>
              Admin Settings
            </h1>

            <p>
              Manage your system settings and preferences
            </p>

          </div>

        </div>


        {/* =================================
            TOP GRID
        ================================= */}

        <div className="settings-top-grid">


          {/* =================================
              GENERAL SETTINGS
          ================================= */}

          <div className="settings-card">

            <h2>
              General Settings
            </h2>

            <p className="settings-description">
              Basic system configuration
            </p>


            {/* APPLICATION NAME */}

            <div className="settings-form-group">

              <label>
                Application Name
              </label>

              <input
                type="text"
                value={appName}
                onChange={(e) =>
                  setAppName(e.target.value)
                }
              />

            </div>


            {/* SYSTEM EMAIL */}

            <div className="settings-form-group">

              <label>
                System Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>


            {/* SUPPORT EMAIL */}

            <div className="settings-form-group">

              <label>
                Support Email
              </label>

              <input
                type="email"
                value={supportEmail}
                onChange={(e) =>
                  setSupportEmail(e.target.value)
                }
              />

            </div>


            {/* TIMEZONE */}

            <div className="settings-form-group">

              <label>
                Timezone
              </label>

              <select
                value={timezone}
                onChange={(e) =>
                  setTimezone(e.target.value)
                }
              >

                <option value="Asia/Kolkata">
                  Asia/Kolkata
                </option>

                <option value="Asia/Dubai">
                  Asia/Dubai
                </option>

                <option value="Europe/London">
                  Europe/London
                </option>

                <option value="America/New_York">
                  America/New_York
                </option>

              </select>

            </div>


            {/* SAVE */}

            <button
              type="button"
              className="save-button"
              onClick={handleGeneralSave}
            >
              💾 Save Changes
            </button>

          </div>


          {/* =================================
              THEME SETTINGS
          ================================= */}

          <div className="settings-card">

            <h2>
              Theme Settings
            </h2>

            <p className="settings-description">
              Customize the application appearance
            </p>


            {/* THEME MODE */}

            <label className="theme-label">
              Theme Mode
            </label>


            <div className="theme-options">


              {/* LIGHT */}

              <button
                type="button"
                className={
                  theme === "Light"
                    ? "theme-option active"
                    : "theme-option"
                }
                onClick={() =>
                  setTheme("Light")
                }
              >

                <span className="theme-icon">
                  ☀
                </span>

                <span>
                  Light
                </span>

              </button>


              {/* DARK */}

              <button
                type="button"
                className={
                  theme === "Dark"
                    ? "theme-option active"
                    : "theme-option"
                }
                onClick={() =>
                  setTheme("Dark")
                }
              >

                <span className="theme-icon">
                  ◐
                </span>

                <span>
                  Dark
                </span>

              </button>


              {/* SYSTEM */}

              <button
                type="button"
                className={
                  theme === "System"
                    ? "theme-option active"
                    : "theme-option"
                }
                onClick={() =>
                  setTheme("System")
                }
              >

                <span className="theme-icon">
                  🖥
                </span>

                <span>
                  System
                </span>

              </button>

            </div>


            {/* PRIMARY COLOR */}

            <label className="theme-label">
              Primary Color
            </label>


            <div className="color-options">


              {/* PURPLE */}

              <button
                type="button"
                aria-label="Purple"
                className={
                  primaryColor === "#4f46e5"
                    ? "color-circle purple active"
                    : "color-circle purple"
                }
                onClick={() =>
                  setPrimaryColor("#4f46e5")
                }
              />


              {/* BLUE */}

              <button
                type="button"
                aria-label="Blue"
                className={
                  primaryColor === "#2196f3"
                    ? "color-circle blue active"
                    : "color-circle blue"
                }
                onClick={() =>
                  setPrimaryColor("#2196f3")
                }
              />


              {/* GREEN */}

              <button
                type="button"
                aria-label="Green"
                className={
                  primaryColor === "#14b8a6"
                    ? "color-circle green active"
                    : "color-circle green"
                }
                onClick={() =>
                  setPrimaryColor("#14b8a6")
                }
              />


              {/* ORANGE */}

              <button
                type="button"
                aria-label="Orange"
                className={
                  primaryColor === "#f97316"
                    ? "color-circle orange active"
                    : "color-circle orange"
                }
                onClick={() =>
                  setPrimaryColor("#f97316")
                }
              />


              {/* RED */}

              <button
                type="button"
                aria-label="Red"
                className={
                  primaryColor === "#ef4444"
                    ? "color-circle red active"
                    : "color-circle red"
                }
                onClick={() =>
                  setPrimaryColor("#ef4444")
                }
              />


              {/* VIOLET */}

              <button
                type="button"
                aria-label="Violet"
                className={
                  primaryColor === "#7c3aed"
                    ? "color-circle violet active"
                    : "color-circle violet"
                }
                onClick={() =>
                  setPrimaryColor("#7c3aed")
                }
              />

            </div>


            {/* SAVE THEME */}

            <button
              type="button"
              className="save-button"
              onClick={handleThemeSave}
            >
              🎨 Save Changes
            </button>

          </div>

        </div>


        {/* =================================
            BOTTOM GRID
        ================================= */}

        <div className="settings-bottom-grid">


          {/* =================================
              NOTIFICATION SETTINGS
          ================================= */}

          <div className="settings-card">


            <div className="card-heading">

              <div className="card-heading-icon">
                🔔
              </div>

              <div>

                <h2>
                  Notification Settings
                </h2>

                <p>
                  Manage system notifications
                </p>

              </div>

            </div>


            {/* DOCUMENT NOTIFICATION */}

            <div className="notification-row">

              <div>

                <strong>
                  New Document Notifications
                </strong>

                <p>
                  Get notified when new documents are uploaded
                </p>

              </div>

              <button
                type="button"
                className={
                  newDocumentNotification
                    ? "toggle active"
                    : "toggle"
                }
                onClick={
                  toggleDocumentNotification
                }
              >

                <span></span>

              </button>

            </div>


            {/* USER NOTIFICATION */}

            <div className="notification-row">

              <div>

                <strong>
                  User Registration Notifications
                </strong>

                <p>
                  Get notified when new users register
                </p>

              </div>

              <button
                type="button"
                className={
                  userNotification
                    ? "toggle active"
                    : "toggle"
                }
                onClick={
                  toggleUserNotification
                }
              >

                <span></span>

              </button>

            </div>


            {/* SYSTEM NOTIFICATION */}

            <div className="notification-row">

              <div>

                <strong>
                  System Updates
                </strong>

                <p>
                  Get notified about system updates and maintenance
                </p>

              </div>

              <button
                type="button"
                className={
                  systemNotification
                    ? "toggle active"
                    : "toggle"
                }
                onClick={
                  toggleSystemNotification
                }
              >

                <span></span>

              </button>

            </div>

          </div>


          {/* =================================
              SYSTEM INFORMATION
          ================================= */}

          <div className="settings-card system-card">


            <div className="card-heading">

              <div className="card-heading-icon">
                ⓘ
              </div>

              <div>

                <h2>
                  System Information
                </h2>

                <p>
                  Current system details
                </p>

              </div>

            </div>
            
<button
  type="button"
  className="save-button"
  onClick={createSystemUpdate}
  disabled={!systemNotification}
>
  Create System Update Notification
</button>



            {/* VERSION */}

            <div className="system-info-row">

              <span>
                Application Version
              </span>

              <strong>
                v1.0.0
              </strong>

            </div>


            {/* BACKEND */}

            <div className="system-info-row">

              <span>
                Backend URL
              </span>

              <strong>
                http://localhost:5000
              </strong>

            </div>


            {/* DATABASE */}

            <div className="system-info-row">

              <span>
                Database
              </span>

              <strong>
                MongoDB
              </strong>

            </div>


            {/* ENVIRONMENT */}

            <div className="system-info-row">

              <span>
                Environment
              </span>

              <strong>
                Development
              </strong>

            </div>


            {/* STATUS */}

            <div className="system-info-row">

              <span>
                Status
              </span>

              <strong className="status-online">
                ● Online
              </strong>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default AdminSettings;