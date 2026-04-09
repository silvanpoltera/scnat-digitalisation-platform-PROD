import { useState, useEffect, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, FileText, Calendar, Inbox, Users,
  BarChart3, MessageSquare, Brain, Database, ArrowLeft, LogOut, Menu, X, GitPullRequest,
  Radio, Newspaper,
} from 'lucide-react';
import ScnatLogo from './ScnatLogo';

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
  { label: 'Content', path: '/cp/content', icon: FileText },
  { label: 'Events', path: '/cp/events', icon: Calendar, badgeKey: 'events' },
  { label: 'Anträge', path: '/cp/antraege', icon: Inbox, badgeKey: 'antraege' },
  { label: 'Users', path: '/cp/users', icon: Users },
  { label: 'Changes', path: '/cp/changes', icon: GitPullRequest, badgeKey: 'changes' },
  { label: 'Massnahmen', path: '/cp/massnahmen', icon: BarChart3 },
  { label: 'Themen', path: '/cp/themen', icon: MessageSquare, badgeKey: 'themen' },
  { label: 'KI', path: '/cp/ki', icon: Brain },
  { label: 'SCNAT DB', path: '/cp/scnat-db', icon: Database },
];

export default function CpLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badges, setBadges] = useState({});

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
        transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:z-40
      `}>
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2">
            <ScnatLogo size={24} subtitle="Control Panel" />
            <span className="ml-auto text-[9px] font-mono bg-scnat-red/20 text-scnat-red px-1.5 py-0.5 rounded-sm">Admin</span>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-txt-tertiary hover:text-txt-primary p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
          {cpNavItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            const badgeCount = item.badgeKey ? (badges[item.badgeKey] || 0) : 0;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 text-sm rounded-sm transition-colors duration-150 ${
                  active
                    ? 'bg-bg-elevated text-txt-primary border border-bd-default'
                    : badgeCount > 0
                      ? 'text-scnat-red bg-scnat-red/5 border border-scnat-red/15 hover:bg-scnat-red/10'
                      : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-elevated border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
                {badgeCount > 0 && (
                  <span className="ml-auto flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-scnat-red text-white text-[10px] font-bold leading-none">
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-bd-faint space-y-1">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-txt-secondary hover:text-txt-primary rounded-sm hover:bg-bg-elevated transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Zurück zum Portal
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-txt-tertiary hover:text-txt-secondary rounded-sm hover:bg-bg-elevated transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Abmelden
          </button>
        </div>
      </aside>

      <div className="md:ml-56 min-h-screen">
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
