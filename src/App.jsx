import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminDashboard from "./pages/admin/AdminDashboard";
import DocumentManagement from "./pages/admin/AdminDocuments";
import HighlightsManagement from "./pages/admin/HighlightsManagement";
import UserManagement from "./pages/admin/UserManagement";
import AdminDocuments from "./pages/admin/AdminDocuments";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default page */}
        <Route
          path="/"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        {/* Admin pages */}
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

      </Routes>
    </BrowserRouter>
  );
}

export default App;