import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/projects': 'Projects',
  '/deadlines': 'Deadlines',
  '/settings': 'Settings',
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Derive page title from current route
  const title = PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/projects/') ? 'Project Details' : 'Proj.io');

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar title={title} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
