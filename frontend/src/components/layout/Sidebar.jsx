import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES } from '../../utils/constants';
import { DashboardIcon, ProjectsIcon, DeadlinesIcon, SettingsIcon, LogoutIcon, SunIcon, MoonIcon, NotebookIcon } from '../ui/Icons';
import ConfirmModal from '../ui/ConfirmModal';
import './Sidebar.css';

const navItems = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', Icon: DashboardIcon },
  { path: ROUTES.PROJECTS, label: 'Projects', Icon: ProjectsIcon },
  { path: ROUTES.DEADLINES, label: 'Deadlines', Icon: DeadlinesIcon },
];

const bottomItems = [
  { path: ROUTES.SETTINGS, label: 'Settings', Icon: SettingsIcon },
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <NotebookIcon size={28} className="sidebar-logo-icon" />
          <h1 className="sidebar-logo-text">Proj.io</h1>
        </div>

        <div className="sidebar-divider" />

        {/* Main nav */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
              onClick={onClose}
            >
              <span className="sidebar-link-icon">
                <item.Icon size={20} />
              </span>
              <span className="sidebar-link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-divider" />

        {/* Bottom nav */}
        <nav className="sidebar-nav sidebar-nav-bottom">
          {bottomItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
              onClick={onClose}
            >
              <span className="sidebar-link-icon">
                <item.Icon size={20} />
              </span>
              <span className="sidebar-link-label">{item.label}</span>
            </NavLink>
          ))}
          <button className="sidebar-link" onClick={() => setShowLogoutModal(true)}>
            <span className="sidebar-link-icon">
              <LogoutIcon size={20} />
            </span>
            <span className="sidebar-link-label">Logout</span>
          </button>
        </nav>

        <div className="sidebar-divider" />

        {/* Theme toggle */}
        <div className="sidebar-theme-toggle">
          <span className="sidebar-theme-label">
            <span className={`theme-icon-wrapper ${isDark ? 'theme-icon-dark' : 'theme-icon-light'}`}>
              {isDark ? <MoonIcon size={16} /> : <SunIcon size={16} />}
            </span>
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </span>
          <button
            className={`theme-switch ${isDark ? 'theme-switch-on' : ''}`}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <span className="theme-switch-thumb" />
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout? You'll need to sign in again to access your projects."
        confirmLabel="Logout"
        cancelLabel="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        danger
      />
    </>
  );
}
