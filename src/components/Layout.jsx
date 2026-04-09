import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import Sidebar from './Sidebar';
import NewsTicker from './NewsTicker';
import Footer from './Footer';
import ScnatLogo from './ScnatLogo';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-base">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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

      <div className="md:ml-56 flex flex-col min-h-screen">
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
