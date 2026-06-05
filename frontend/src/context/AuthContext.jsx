import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';
import { API } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for existing token and restore user
  useEffect(() => {
    const token = localStorage.getItem('projio_token');
    const savedUser = localStorage.getItem('projio_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('projio_token');
        localStorage.removeItem('projio_user');
      }
    }
    setLoading(false);
  }, []);

  const signup = useCallback(async (data) => {
    const response = await authService.signup(data);
    localStorage.setItem('projio_token', response.token);
    localStorage.setItem('projio_user', JSON.stringify(response.user));
    setUser(response.user);
    return response;
  }, []);

  const login = useCallback(async (data) => {
    const response = await authService.login(data);
    localStorage.setItem('projio_token', response.token);
    localStorage.setItem('projio_user', JSON.stringify(response.user));
    setUser(response.user);
    return response;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('projio_token');
    localStorage.removeItem('projio_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('projio_user', JSON.stringify(updatedUser));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get(API.USERS.ME);
      updateUser(response.data);
    } catch {
      // Ignore errors during refresh
    }
  }, [updateUser]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signup,
    login,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
