// frontend/src/context/AuthContext.jsx

import { createContext, useContext, useState } from 'react';

const MOCK_USER = {
  name: 'Dev User',
  email: 'dev@renci.org',
  initials: 'DU',
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  function login() {
    // Placeholder — replace with real AD/SSO callback later
    setUser(MOCK_USER);
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}