import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home, Target, Layers, Monitor, Brain, GitBranch,
  Users, HelpCircle, BookOpen, BarChart3, GraduationCap,
  LogOut, Search, Settings, X,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import SearchModal from './SearchModal';
import NetworkBackground from './NetworkBackground';
import ScnatLogo from './ScnatLogo';

const navItems = [
  { label: 'Übersicht', path: '/', icon: Home },
  { label: 'Strategie', path: '/strategie', icon: Target },
  { label: 'Handlungsfelder', path: '/handlungsfelder', icon: Layers },
  { label: 'Massnahmen', path: '/massnahmen', icon: BarChart3 },
  { label: 'Software & Co', path: '/systemlandschaft', icon: Monitor },
  { label: 'KI', path: '/ki-hub', icon: Brain },
  { label: 'Schulungen', path: '/schulungen', icon: GraduationCap },
  { label: 'Prozesse', path: '/prozesse', icon: GitBranch },
  { label: 'Team', path: '/team', icon: Users },
  { label: 'FAQs', path: '/faqs', icon: HelpCircle },
  { label: 'Glossar', path: '/glossar', icon: BookOpen },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname]);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-0 bottom-0 w-56 bg-bg-surface border-r border-bd-faint flex flex-col z-50
        transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:z-40
      `}>
        <div className="relative p-4 pb-2 overflow-hidden">
          <NetworkBackground nodeCount={18} seed={7} accentColor="#EA515A" opacity={0.25} showPulse={false} />
          <div className="relative z-10 flex items-center justify-between">
            <Link to="/">
              <ScnatLogo size={24} subtitle="Digitalisierung" />
            </Link>
            <button onClick={onClose} className="md:hidden text-txt-tertiary hover:text-txt-primary p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-3 py-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-txt-secondary border border-bd-faint rounded-sm hover:border-bd-default transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Suchen</span>
            <kbd className="ml-auto text-[10px] font-mono text-txt-tertiary">
              {isMac ? '⌘' : '⌃'}K
            </kbd>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 text-sm rounded-sm transition-colors duration-150 ${
                  active
                    ? 'bg-bg-elevated text-txt-primary border border-bd-default'
                    : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-elevated border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-bd-faint">
          {user && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-sm bg-bg-elevated border border-bd-faint flex items-center justify-center text-xs font-mono text-txt-secondary">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-txt-primary truncate">{user.name}</p>
                <p className="text-[10px] text-txt-tertiary truncate">{user.email}</p>
              </div>
            </div>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/cp"
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-scnat-red hover:text-scnat-red/80 rounded-sm hover:bg-scnat-red/10 transition-colors mb-1"
            >
              <Settings className="w-3.5 h-3.5" />
              Control Panel
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-txt-tertiary hover:text-txt-secondary rounded-sm hover:bg-bg-elevated transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Abmelden
          </button>
        </div>
      </aside>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
