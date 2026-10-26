import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./pages/admin/ThemeContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDocuments from "./pages/admin/AdminDocuments";
import HighlightsManagement from "./pages/admin/HighlightsManagement";
import UserManagement from "./pages/admin/UserManagement";
import AdminSettings from "./pages/admin/AdminSettings";
import ContactMessages from "./pages/admin/ContactMessages";

// User pages
import UserDashboard from "./pages/user/UserDashboard";
import ChatInterface from "./pages/user/ChatInterface";
import Documents from "./pages/user/Documents";
import Highlights from "./pages/user/Highlights";
import History from "./pages/user/History";
import Profile from "./pages/user/Profile";
import ForgotPassword from "./pages/ForgotPassword";


function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>

          {/* =========================
              HOME
          ========================= */}

          <Route
            path="/"
            element={<Home />}
          />

          {/* =========================
              AUTHENTICATION
          ========================= */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          {/* =========================
              ADMIN PAGES
          ========================= */}

          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/documents"
            element={<AdminDocuments />}
          />

          <Route
            path="/admin/highlights"
            element={<HighlightsManagement />}
          />

          <Route
            path="/admin/users"
            element={<UserManagement />}
          />

          <Route
            path="/admin/settings"
            element={<AdminSettings />}
          />

          {/* =========================
              USER PAGES
          ========================= */}
          {/* =========================
    USER PAGES
========================= */}

<Route
  path="/user/dashboard"
  element={<UserDashboard />}
/>

<Route
  path="/user-dashboard"
  element={<UserDashboard />}
/>

<Route
  path="/user/chat"
  element={<ChatInterface />}
/>

<Route
  path="/user/documents"
  element={<Documents />}
/>
<Route
  path="/user/highlights"
  element={<Highlights />}
/>
<Route
  path="/user/history"
  element={<History />}
/>
<Route
  path="/user/profile"
  element={<Profile />}
/>
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route
  path="/admin/contact-messages"
  element={<ContactMessages />}
/>

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
