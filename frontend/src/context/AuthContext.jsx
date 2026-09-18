import { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('smartspend_token');
    const userData = localStorage.getItem('smartspend_user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem('smartspend_token', data.token);
    localStorage.setItem('smartspend_user', JSON.stringify({ name: data.name, email: data.email }));
    setUser({ name: data.name, email: data.email });
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    localStorage.setItem('smartspend_token', data.token);
    localStorage.setItem('smartspend_user', JSON.stringify({ name: data.name, email: data.email }));
    setUser({ name: data.name, email: data.email });
  };

  const logout = () => {
    localStorage.removeItem('smartspend_token');
    localStorage.removeItem('smartspend_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
