// frontend/src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PreviewPage from './pages/PreviewPage';
import AddProjectPage from './pages/AddProjectPage';
import AddPersonPage from './pages/AddPersonPage';
import UpdateProjectPage from './pages/UpdateProjectPage';
import UpdatePersonPage from './pages/UpdatePersonPage';
import ArchiveProjectPage from './pages/ArchiveProjectPage';
import ArchivePersonPage from './pages/ArchivePersonPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
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
          {/* Catch-all — redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}