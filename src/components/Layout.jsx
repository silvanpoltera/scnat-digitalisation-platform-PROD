import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import NewsTicker from './NewsTicker';
import Footer from './Footer';
import ScnatLogo from './ScnatLogo';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-bg-base">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 md:hidden bg-bg-surface border-b border-bd-faint">
        <div className="flex items-center gap-3 px-4 h-12">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-txt-secondary hover:text-txt-primary p-1 -ml-1"
          >
            <Menu className="w-5 h-5" />
          </button>
          <ScnatLogo size={20} subtitle="Digitalisierung" />
        </div>
      </div>

      <div className={`${collapsed ? 'md:ml-14' : 'md:ml-56'} flex flex-col min-h-screen transition-[margin] duration-200 ease-in-out`}>
        <div className="hidden md:block">
          <NewsTicker />
        </div>
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
