import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check local token or session
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('ngt_token');
        const res = await fetch('/api/auth/me', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.user) {
            setUser(data.user);
          }
        }
      } catch (_) {
        // Offline or backend unavailable; check local storage fallback
        try {
          const cached = localStorage.getItem('ngt_cached_user');
          if (cached) {
            setUser(JSON.parse(cached));
          }
        } catch (__) {}
      }
    };

    checkAuth();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    try {
      if (token) localStorage.setItem('ngt_token', token);
      if (userData) localStorage.setItem('ngt_cached_user', JSON.stringify(userData));
    } catch (_) {}
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('ngt_token');
      localStorage.removeItem('ngt_cached_user');
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch (_) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
