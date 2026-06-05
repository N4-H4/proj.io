import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon, SettingsIcon } from '../components/ui/Icons';

export default function SettingsPage() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div className="card" style={{ maxWidth: '500px' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SettingsIcon size={18} />
          Profile
        </h3>

        <div style={{ marginBottom: '1rem' }}>
          <span className="input-label">Name</span>
          <p style={{ fontSize: '0.9375rem' }}>{user?.name || '—'}</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <span className="input-label">Email</span>
          <p style={{ fontSize: '0.9375rem' }}>{user?.email || '—'}</p>
        </div>

        <div style={{ borderTop: '1px dashed var(--border-dashed)', paddingTop: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Appearance</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
        </div>
      </div>
    </div>
  );
}
