import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { API } from '../utils/constants';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { user, updateUser, isAuthenticated } = useAuth();

  const [theme, setThemeState] = useState(() => {
    // Priority: user profile > localStorage > default
    const saved = localStorage.getItem('projio_theme');
    return saved || 'LIGHT';
  });

  // Sync theme from user profile when logged in
  useEffect(() => {
    if (user?.themeMode) {
      setThemeState(user.themeMode);
    }
  }, [user?.themeMode]);

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'DARK') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem('projio_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(async () => {
    const newTheme = theme === 'LIGHT' ? 'DARK' : 'LIGHT';
    setThemeState(newTheme);

    if (isAuthenticated) {
      try {
        const response = await api.put(API.USERS.THEME, { themeMode: newTheme });
        updateUser(response.data);
      } catch {
        // Theme is already applied locally even if backend save fails
      }
    }
  }, [theme, isAuthenticated, updateUser]);

  const value = {
    theme,
    isDark: theme === 'DARK',
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
