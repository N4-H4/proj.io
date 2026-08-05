import { MenuIcon, ArrowLeftIcon } from '../ui/Icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './TopBar.css';

export default function TopBar({ title, onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation(); // Re-render on route change
  
  // React Router tracks history index in window.history.state.idx
  const hasHistory = window.history.state && window.history.state.idx > 0;
  
  return (
    <header className="topbar">
      <div className="topbar-actions">
        <button 
          className="topbar-back-btn" 
          onClick={() => { if (hasHistory) navigate(-1); }} 
          aria-label="Go back"
          disabled={!hasHistory}
        >
          <ArrowLeftIcon size={20} />
        </button>
        <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">

          <MenuIcon size={22} />
        </button>
      </div>
      <h2 className="topbar-title">{title}</h2>
    </header>
  );
}
