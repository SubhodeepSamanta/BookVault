import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'
  const { addToast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('bv_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (err) {
          localStorage.removeItem('bv_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data;
      localStorage.setItem('bv_token', token);
      setUser(user);
      addToast('Welcome back, ' + user.name, 'success');
      setAuthModalOpen(false);
      return true;
    } catch (err) {
      addToast(err.response?.data?.error || 'Login failed', 'error');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const { user, token } = res.data;
      localStorage.setItem('bv_token', token);
      setUser(user);
      addToast('Account created successfully!', 'success');
      setAuthModalOpen(false);
      return true;
    } catch (err) {
      addToast(err.response?.data?.error || 'Registration failed', 'error');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bv_token');
    addToast('Logged out successfully', 'info');
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      openAuthModal,
      closeAuthModal,
      authModalOpen,
      authModalMode,
      setAuthModalMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
