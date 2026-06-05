import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES } from '../../utils/constants';
import './Sidebar.css';

const navItems = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: '📊' },
  { path: ROUTES.PROJECTS, label: 'Projects', icon: '📁' },
  { path: ROUTES.TASKS, label: 'Tasks', icon: '✅' },
  { path: ROUTES.BRAIN_DUMP, label: 'Brain Dump', icon: '💡' },
  { path: ROUTES.DEADLINES, label: 'Deadlines', icon: '📅' },
];

const bottomItems = [
  { path: ROUTES.SETTINGS, label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
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
          <span className="sidebar-logo-icon">📓</span>
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
              <span className="sidebar-link-icon">{item.icon}</span>
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
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
            </NavLink>
          ))}
          <button className="sidebar-link" onClick={handleLogout}>
            <span className="sidebar-link-icon">🚪</span>
            <span className="sidebar-link-label">Logout</span>
          </button>
        </nav>

        <div className="sidebar-divider" />

        {/* Theme toggle */}
        <div className="sidebar-theme-toggle">
          <span className="sidebar-theme-label">
            {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
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
    </>
  );
}
