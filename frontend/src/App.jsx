// frontend/src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from 'react-oidc-context';
import { AuthStateProvider } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import HomePage from './pages/HomePage';
import PreviewPage from './pages/PreviewPage';
import AddProjectPage from './pages/AddProjectPage';
import AddPersonPage from './pages/AddPersonPage';
import UpdateProjectPage from './pages/UpdateProjectPage';
import UpdatePersonPage from './pages/UpdatePersonPage';
import ArchiveProjectPage from './pages/ArchiveProjectPage';
import ArchivePersonPage from './pages/ArchivePersonPage';
import { useAuth } from './context/AuthContext';

const oidcConfig = {
  authority: 'https://accounts.google.com',
  client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
  redirect_uri: `${window.location.origin}/auth/callback`,
  scope: 'openid profile email',
};

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

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
    <AuthProvider {...oidcConfig}>
      <BrowserRouter>
        <AuthStateProvider>
          <AppRoutes />
        </AuthStateProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}