// frontend/src/context/AuthContext.jsx

import { createContext, useContext, useMemo } from 'react';
import { useAuth as useOidcAuth } from 'react-oidc-context';

const AuthContext = createContext(null);

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AuthStateProvider({ children }) {
  const oidc = useOidcAuth();

  const user = useMemo(() => {
    if (!oidc.user) return null;
    const profile = oidc.user.profile;
    const user = {
      name: profile.name ?? profile.email,
      email: profile.email,
      initials: getInitials(profile.name ?? profile.email),
    };
    console.log('[Auth] Signed in:', { name: user.name, email: user.email, initials: user.initials });
    return user;
  }, [oidc.user]);

  function login() {
    oidc.signinRedirect();
  }

  function logout() {
    oidc.removeUser();
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!oidc.user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthStateProvider');
  return ctx;
}