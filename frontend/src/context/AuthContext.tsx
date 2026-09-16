import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  allowedScreens: string[];
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  allowedScreens: [],
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const [allowedScreens, setAllowedScreens] = useState<string[]>([]);

  useEffect(() => {
    if (token && user) {
      if (user.role === 'SUPER_ADMIN') {
        // SUPER_ADMIN has hardcoded full access
        setAllowedScreens(['HOME', 'CALENDAR', 'NEW_BOOKING', 'REPORTS', 'ATTENDANCE', 'WORKERS', 'SETUP', 'STAFF']);
      } else {
        axiosClient.get('/permissions/my').then(res => {
          setAllowedScreens(res.data.data);
        }).catch(err => {
          console.error("Failed to load permissions", err);
          // Default fallback
          setAllowedScreens(['HOME']);
        });
      }
    }
  }, [token, user]);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAllowedScreens([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, allowedScreens, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
