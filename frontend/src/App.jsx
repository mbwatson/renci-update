// frontend/src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import PreviewPage from './pages/PreviewPage';
import AddProjectPage from './pages/AddProjectPage';
import AddPersonPage from './pages/AddPersonPage';
import UpdateProjectPage from './pages/UpdateProjectPage';
import UpdatePersonPage from './pages/UpdatePersonPage';
import ArchiveProjectPage from './pages/ArchiveProjectPage';
import ArchivePersonPage from './pages/ArchivePersonPage';

// Redirects to /login if not authenticated
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Login — no Layout wrapper, no header/footer */}
      <Route path="/login" element={<LoginPage />} />

      {/* All authenticated routes share the Layout */}
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/add/project" element={<AddProjectPage />} />
        <Route path="/add/person" element={<AddPersonPage />} />
        <Route path="/update/project" element={<UpdateProjectPage />} />
        <Route path="/update/person" element={<UpdatePersonPage />} />
        <Route path="/archive/project" element={<ArchiveProjectPage />} />
        <Route path="/archive/person" element={<ArchivePersonPage />} />
        {import.meta.env.DEV && (
          <Route path="/preview" element={<PreviewPage />} />
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}