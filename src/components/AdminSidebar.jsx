
import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Star,
  Users,
  Settings,
  Bell,
  MessageSquare
} from "lucide-react";
import "./AdminSidebar.css";

function AdminSidebar() {
  const navigate = useNavigate();

  // APPLICATION NAME
  const [appName, setAppName] = useState(
    localStorage.getItem("appName") || "InfoHub"
  );

  // NOTIFICATIONS
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // UPDATE APPLICATION NAME
  useEffect(() => {
    const updateAppName = () => {
      setAppName(localStorage.getItem("appName") || "InfoHub");
    };

    window.addEventListener("storage", updateAppName);
    window.addEventListener("appNameUpdated", updateAppName);

    return () => {
      window.removeEventListener("storage", updateAppName);
      window.removeEventListener("appNameUpdated", updateAppName);
    };
  }, []);

  // FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
      const [notificationResponse, settingsResponse] =
        await Promise.all([
          fetch("http://localhost:5000/api/notifications"),
          fetch("http://localhost:5000/api/notification-settings")
        ]);

      if (!notificationResponse.ok || !settingsResponse.ok) {
        throw new Error("Failed to fetch notifications or settings");
      }

      const notificationData = await notificationResponse.json();
      const settingsData = await settingsResponse.json();

      const allNotifications = Array.isArray(notificationData)
        ? notificationData
        : Array.isArray(notificationData.notifications)
          ? notificationData.notifications
          : [];

      const settings = settingsData.settings || settingsData;

      const enabledNotifications = allNotifications.filter(
        (notification) => {
          if (notification.type === "document_upload") {
            return settings.newDocumentNotification !== false;
          }

          if (notification.type === "user_registration") {
            return settings.userNotification !== false;
          }

          if (notification.type === "system_update") {
            return settings.systemNotification !== false;
          }

          return true;
        }
      );

      setNotifications(enabledNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // LOAD NOTIFICATIONS
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 5000);

    return () => clearInterval(interval);
  }, []);

  // MARK NOTIFICATION AS READ
  const handleNotificationClick = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${id}/read`,
        { method: "PUT" }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="admin-sidebar">
      <div>
        {/* LOGO AND APPLICATION NAME */}
        <div className="sidebar-logo">
          <div className="logo-circle">
            {appName.charAt(0).toUpperCase()}
          </div>
          <h2>{appName}</h2>
        </div>

        {/* ADMIN PANEL */}
        <div className="sidebar-admin">
          <p>ADMIN PANEL</p>
        </div>

        {/* NAVIGATION MENU */}
        <nav className="sidebar-menu">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive ? "menu-item active-menu" : "menu-item"
            }
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/documents"
            className={({ isActive }) =>
              isActive ? "menu-item active-menu" : "menu-item"
            }
          >
            <FileText size={20} />
            <span>Documents</span>
          </NavLink>

          <NavLink
            to="/admin/highlights"
            className={({ isActive }) =>
              isActive ? "menu-item active-menu" : "menu-item"
            }
          >
            <Star size={20} />
            <span>Highlights</span>
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive ? "menu-item active-menu" : "menu-item"
            }
          >
            <Users size={20} />
            <span>Users</span>
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              isActive ? "menu-item active-menu" : "menu-item"
            }
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>

          <NavLink
            to="/admin/contact-messages"
            className={({ isActive }) =>
              isActive ? "menu-item active-menu" : "menu-item"
            }
          >
            <MessageSquare size={20} />
            <span>Contact Messages</span>
          </NavLink>
        </nav>

        {/* NOTIFICATIONS */}
        <div className="sidebar-notification-container">
          <button
            type="button"
            className="notification-button"
            onClick={() => setShowNotifications((previous) => !previous)}
          >
            <Bell size={20} />
            <span>Notifications</span>

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount}
              </span>
            )}
          </button>

          {/* NOTIFICATION PANEL */}
          {showNotifications && (
            <div className="notification-panel">
              <div className="notification-header">
                <strong>Notifications</strong>
                <span>{unreadCount} unread</span>
              </div>

              {notifications.length === 0 ? (
                <div className="no-notifications">
                  <Bell size={22} />
                  <p>No notifications found</p>
                </div>
              ) : (
                <div className="notification-list">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={
                        notification.read
                          ? "notification-item"
                          : "notification-item unread"
                      }
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        handleNotificationClick(notification._id)
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();
                          handleNotificationClick(notification._id);
                        }
                      }}
                    >
                      <div className="notification-icon">
                        <Bell size={16} />
                      </div>

                      <div className="notification-content">
                        <strong>{notification.title || "Notification"}</strong>
                        <p>{notification.message || ""}</p>

                        <small>
                          {notification.createdAt
                            ? new Date(
                                notification.createdAt
                              ).toLocaleString()
                            : ""}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* LOGOUT */}
      <div className="sidebar-logout">
        <button
          type="button"
          className="menu-item logout-item"
          onClick={handleLogout}
        >
          <span>↪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default AdminSidebar;
