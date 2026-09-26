import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./pages/admin/ThemeContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDocuments from "./pages/admin/AdminDocuments";
import HighlightsManagement from "./pages/admin/HighlightsManagement";
import UserManagement from "./pages/admin/UserManagement";
import AdminSettings from "./pages/admin/AdminSettings";
import UserDashboard from "./pages/user/UserDashboard";
import ChatInterface from "./pages/user/ChatInterface";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>

          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin Pages */}
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
          <Route
                path="/user-dashboard"
                element={<UserDashboard />}
              />
              <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/chat" element={<ChatInterface />} />

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

