import { useState, useEffect, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, FileText, Calendar, Inbox, Users,
  BarChart3, MessageSquare, Brain, Database, ArrowLeft, LogOut, Menu, X, GitPullRequest,
  Radio, Newspaper, FolderOpen, ChevronsLeft, ChevronsRight, Sun, Moon, Megaphone,
} from 'lucide-react';
import ScnatLogo from './ScnatLogo';
import { ScnatMark } from './ScnatLogo';
import { useTheme } from '../contexts/ThemeContext';

const SECTION_MAP = {
  '/cp/antraege': 'antraege',
  '/cp/changes': 'changes',
  '/cp/events': 'events',
  '/cp/themen': 'themen',
};

const cpNavItems = [
  { label: 'Dashboard', path: '/cp', icon: LayoutDashboard },
  { label: 'Live Infos', path: '/cp/live-infos', icon: Radio },
  { label: 'News', path: '/cp/news', icon: Newspaper },
  { label: 'Nachrichten', path: '/cp/nachrichten', icon: Megaphone },
  { label: 'Content', path: '/cp/content', icon: FileText },
  { label: 'Events', path: '/cp/events', icon: Calendar, badgeKey: 'events' },
  { label: 'Anträge', path: '/cp/antraege', icon: Inbox, badgeKey: 'antraege' },
  { label: 'Users', path: '/cp/users', icon: Users },
  { label: 'Changes', path: '/cp/changes', icon: GitPullRequest, badgeKey: 'changes' },
  { label: 'Massnahmen', path: '/cp/massnahmen', icon: BarChart3 },
  { label: 'Themen', path: '/cp/themen', icon: MessageSquare, badgeKey: 'themen' },
  { label: 'KI', path: '/cp/ki', icon: Brain },
  { label: 'SCNAT DB', path: '/cp/scnat-db', icon: Database },
  { label: 'Admin Stuff', path: '/cp/admin-stuff', icon: FolderOpen },
];

export default function CpLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badges, setBadges] = useState({});
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('cp-sidebar-collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('cp-sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  const refreshBadges = useCallback(() => {
    fetch('/api/notifications/admin', { credentials: 'include' })
      .then(r => r.ok ? r.json() : {})
      .then(setBadges)
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshBadges();
    const interval = setInterval(refreshBadges, 30000);
    return () => clearInterval(interval);
  }, [refreshBadges]);

  useEffect(() => {
    setSidebarOpen(false);
    const section = SECTION_MAP[location.pathname];
    if (section && badges[section] > 0) {
      fetch('/api/notifications/admin/seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ section }),
      }).then(() => {
        setBadges(prev => ({ ...prev, [section]: 0 }));
      }).catch(() => {});
    }
  }, [location.pathname]);

  const totalBadges = Object.values(badges).reduce((s, n) => s + (n || 0), 0);

  return (
    <div className="min-h-screen bg-bg-base">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed left-0 top-0 bottom-0 w-56 bg-bg-surface border-r border-bd-faint flex flex-col z-50
        transition-all duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:z-40
        ${collapsed ? 'md:w-14' : 'md:w-56'}
      `}>
        {/* Header */}
        <div className={`p-4 pb-2 ${collapsed ? 'md:p-2' : ''}`}>
          <div className={`flex items-center gap-2 ${collapsed ? 'md:justify-center' : ''}`}>
            <div className={collapsed ? 'md:hidden' : ''}>
              <ScnatLogo size={24} subtitle="Control Panel" />
            </div>
            {collapsed && (
              <Link to="/cp" className="hidden md:block" title="SCNAT Control Panel">
                <ScnatMark size={24} />
              </Link>
            )}
            <span className={`ml-auto text-[9px] font-mono bg-scnat-red/20 text-scnat-red px-1.5 py-0.5 rounded-sm ${collapsed ? 'md:hidden' : ''}`}>
              Admin
            </span>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-txt-tertiary hover:text-txt-primary p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto px-3 py-1 space-y-0.5 ${collapsed ? 'md:px-1.5' : ''}`}>
          {cpNavItems.map(item => {
            const Icon = item.icon;
            const active = item.path === '/cp'
              ? location.pathname === '/cp'
              : location.pathname.startsWith(item.path);
            const badgeCount = item.badgeKey ? (badges[item.badgeKey] || 0) : 0;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 text-sm rounded-sm transition-colors duration-150 ${
                  collapsed ? 'md:justify-center md:px-0 md:py-2 md:gap-0' : ''
                } ${
                  active
                    ? 'bg-bg-elevated text-txt-primary border border-bd-default'
                    : badgeCount > 0
                      ? 'text-scnat-red bg-scnat-red/5 border border-scnat-red/15 hover:bg-scnat-red/10'
                      : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-elevated border border-transparent'
                }`}
              >
                <span className="relative shrink-0">
                  <Icon className="w-4 h-4" />
                  {collapsed && badgeCount > 0 && (
                    <span className="hidden md:flex absolute -top-1.5 -right-1.5 items-center justify-center w-3.5 h-3.5 rounded-full bg-scnat-red text-white text-[7px] font-bold leading-none">
                      {badgeCount}
                    </span>
                  )}
                </span>
                <span className={collapsed ? 'md:hidden' : ''}>{item.label}</span>
                {badgeCount > 0 && (
                  <span className={`ml-auto flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-scnat-red text-white text-[10px] font-bold leading-none ${collapsed ? 'md:hidden' : ''}`}>
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className={`p-3 border-t border-bd-faint space-y-1 ${collapsed ? 'md:p-1.5' : ''}`}>
          <button
            onClick={() => navigate('/')}
            title="Zurück zum Portal"
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-txt-secondary hover:text-txt-primary rounded-sm hover:bg-bg-elevated transition-colors ${
              collapsed ? 'md:justify-center md:px-0 md:py-2 md:gap-0' : ''
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span className={collapsed ? 'md:hidden' : ''}>Zurück zum Portal</span>
          </button>
          <button
            onClick={logout}
            title="Abmelden"
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-txt-tertiary hover:text-txt-secondary rounded-sm hover:bg-bg-elevated transition-colors ${
              collapsed ? 'md:justify-center md:px-0 md:py-2 md:gap-0' : ''
            }`}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className={collapsed ? 'md:hidden' : ''}>Abmelden</span>
          </button>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Bright Mode' : 'Dark Mode'}
          className={`flex items-center gap-2 px-2.5 py-2 border-t border-bd-faint text-txt-tertiary hover:text-txt-primary hover:bg-bg-elevated transition-colors ${
            collapsed ? 'md:justify-center md:px-0' : ''
          }`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
          <span className={`text-xs ${collapsed ? 'md:hidden' : ''}`}>
            {theme === 'dark' ? 'Bright Mode' : 'Dark Mode'}
          </span>
        </button>

        {/* Collapse toggle – desktop only */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="hidden md:flex items-center justify-center p-2.5 border-t border-bd-faint text-txt-tertiary hover:text-txt-primary hover:bg-bg-elevated transition-colors"
          title={collapsed ? 'Sidebar ausklappen' : 'Sidebar einklappen'}
        >
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </button>
      </aside>

      <div className={`${collapsed ? 'md:ml-14' : 'md:ml-56'} min-h-screen transition-[margin] duration-200 ease-in-out`}>
        <header className="sticky top-0 z-30 bg-bg-base/95 backdrop-blur-sm border-b border-bd-faint px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-txt-secondary hover:text-txt-primary p-1 -ml-1"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-heading font-semibold text-txt-primary">Control Panel</h1>
            {totalBadges > 0 && (
              <span className="text-[10px] font-mono text-scnat-red bg-scnat-red/10 px-2 py-0.5 rounded-sm">
                {totalBadges} neu
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-txt-secondary">
            <span className="hidden sm:inline">{user?.name}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-status-green" />
          </div>
        </header>
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
