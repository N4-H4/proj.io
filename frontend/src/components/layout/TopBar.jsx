import { MenuIcon } from '../ui/Icons';
import './TopBar.css';

export default function TopBar({ title, onMenuClick }) {
  return (
    <header className="topbar">
      <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
        <MenuIcon size={22} />
      </button>
      <h2 className="topbar-title">{title}</h2>
    </header>
  );
}
