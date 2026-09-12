import React from "react";
import { NavLink } from "react-router-dom";
import "./AdminSidebar.css";

function AdminSidebar() {
  return (
    <div className="admin-sidebar">
      <div>
        <div className="sidebar-logo">
          <div className="logo-circle">K</div>
          <h2>KnoAI</h2>
        </div>

        <div className="sidebar-admin">
          <p>ADMIN PANEL</p>
        </div>

        <nav className="sidebar-menu">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive ? "menu-item active-menu" : "menu-item"
            }
          >
            <span>▣</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/documents"
            className={({ isActive }) =>
              isActive ? "menu-item active-menu" : "menu-item"
            }
          >
            <span>▤</span>
            Documents
          </NavLink>

          <NavLink
            to="/admin/highlights"
            className={({ isActive }) =>
              isActive ? "menu-item active-menu" : "menu-item"
            }
          >
            <span>★</span>
            Highlights
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive ? "menu-item active-menu" : "menu-item"
            }
          >
            <span>👤</span>
            Users
          </NavLink>

          <div className="menu-item">
            <span>⚙</span>
            Settings
          </div>
        </nav>
      </div>

      <div className="sidebar-logout">
        <div className="menu-item logout-item">
          <span>↪</span>
          Logout
        </div>
      </div>
    </div>
  );
}

export default AdminSidebar;