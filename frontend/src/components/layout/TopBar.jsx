import './TopBar.css';

export default function TopBar({ title, onMenuClick }) {
  return (
    <header className="topbar">
      <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
        ☰
      </button>
      <h2 className="topbar-title">{title}</h2>
    </header>
  );
}
