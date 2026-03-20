import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('nexus_token');
      const storedUser = localStorage.getItem('nexus_user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Optionally verify token with backend
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('nexus_user', JSON.stringify(res.data.user));
          }
        } catch {
          // Token invalid, clear storage
          localStorage.removeItem('nexus_token');
          localStorage.removeItem('nexus_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const register = useCallback(async (name, email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data.success) {
        localStorage.setItem('nexus_token', res.data.token);
        localStorage.setItem('nexus_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      return { success: false, message: msg };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('nexus_token', res.data.token);
        localStorage.setItem('nexus_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      return { success: false, message: msg };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
