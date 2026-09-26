import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Star,
  Users,
  Settings
} from "lucide-react";
import "./AdminSidebar.css";

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

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
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/documents"
            className={({ isActive }) =>
              isActive ? "menu-item active-menu" : "menu-item"
            }
          >
            <FileText size={20} />
            Documents
          </NavLink>

          <NavLink
            to="/admin/highlights"
            className={({ isActive }) =>
              isActive ? "menu-item active-menu" : "menu-item"
            }
          >
            <Star size={20} />
            Highlights
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive ? "menu-item active-menu" : "menu-item"
            }
          >
            <Users size={20} />
            Users
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              isActive ? "menu-item active-menu" : "menu-item"
            }
          >
            <Settings size={20} />
            Settings
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-logout">
        <div 
          className="menu-item logout-item" 
          onClick={handleLogout} 
          style={{ cursor: "pointer" }}
        >
          <span>↪</span>
          Logout
        </div>
      </div>
    </div>
  );
}

export default AdminSidebar;