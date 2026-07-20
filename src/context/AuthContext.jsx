import { createContext, useContext, useState } from 'react';
import { initCleverTap, logoutCleverTap } from '../services/clevertap';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // in-memory only, no localStorage

  const login = (loggedInUser) => {
    // 1. Auth succeeds first...
    setUser(loggedInUser);
    // 2. ...then, and only then, CleverTap gets initialized.
    initCleverTap(loggedInUser);
  };

  const logout = () => {
    logoutCleverTap();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
