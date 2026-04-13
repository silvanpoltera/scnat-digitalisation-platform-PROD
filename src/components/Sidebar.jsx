import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LogOut, Search, X, Bell,
  ChevronsLeft, ChevronsRight, Sun, Moon, Settings, UserCircle,
} from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import SearchModal from './SearchModal';
import NetworkBackground from './NetworkBackground';
import ScnatLogo from './ScnatLogo';
import { ScnatMark } from './ScnatLogo';
import { useNotifications } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import { useVisibility } from '../contexts/VisibilityContext';
import { getSectionMeta } from '../config/sections';

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { count: notifCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const { portal, isVisible } = useVisibility();
  const [searchOpen, setSearchOpen] = useState(false);

  const navItems = useMemo(() =>
    portal
      .filter(s => isVisible(s.key))
      .map(s => ({ ...getSectionMeta(s.key), key: s.key }))
      .filter(s => s.path),
    [portal, isVisible]
  );

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
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-0 bottom-0 w-56 bg-bg-surface border-r border-bd-faint flex flex-col z-50
        transition-all duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:z-40
        ${collapsed ? 'md:w-14' : 'md:w-56'}
      `}>
        <div className={`relative overflow-hidden p-4 pb-2 ${collapsed ? 'md:p-2' : ''}`}>
          <NetworkBackground nodeCount={18} seed={7} accentColor="#EA515A" opacity={0.25} showPulse={false} />
          <div className={`relative z-10 flex items-center justify-between ${collapsed ? 'md:justify-center' : ''}`}>
            <Link to="/" className={collapsed ? 'md:hidden' : ''}>
              <ScnatLogo size={24} subtitle="Digitalisierung" />
            </Link>
            {collapsed && (
              <Link to="/" className="hidden md:block" title="SCNAT Digitalisierung">
                <ScnatMark size={24} />
              </Link>
            )}
            <button onClick={onClose} className="md:hidden text-txt-tertiary hover:text-txt-primary p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className={`px-3 py-2 ${collapsed ? 'md:px-1.5' : ''}`}>
          <button
            onClick={() => setSearchOpen(true)}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-txt-secondary border border-bd-faint rounded-sm hover:border-bd-default transition-colors ${
              collapsed ? 'md:justify-center md:px-2 md:border-transparent md:hover:bg-bg-elevated md:hover:border-transparent' : ''
            }`}
            title="Suchen"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className={collapsed ? 'md:hidden' : ''}>Suchen</span>
            <kbd className={`ml-auto text-[10px] font-mono text-txt-tertiary ${collapsed ? 'md:hidden' : ''}`}>
              {isMac ? '⌘' : '⌃'}K
            </kbd>
          </button>
        </div>

        <nav className={`flex-1 overflow-y-auto px-3 py-1 space-y-0.5 ${collapsed ? 'md:px-1.5' : ''}`}>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.key}
                to={item.path}
                title={item.label}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 text-sm rounded-sm transition-colors duration-150 ${
                  collapsed ? 'md:justify-center md:px-0 md:py-2 md:gap-0' : ''
                } ${
                  active
                    ? 'bg-bg-elevated text-txt-primary border border-bd-default'
                    : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-elevated border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className={collapsed ? 'md:hidden' : ''}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={`p-3 border-t border-bd-faint ${collapsed ? 'md:p-1.5' : ''}`}>
          {user && (
            <div className={`flex items-center gap-2 mb-2 ${collapsed ? 'md:justify-center md:mb-1' : ''}`}>
              <div
                className="w-7 h-7 rounded-sm bg-bg-elevated border border-bd-faint flex items-center justify-center text-xs font-mono text-txt-secondary shrink-0"
                title={user.name}
              >
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className={`flex-1 min-w-0 ${collapsed ? 'md:hidden' : ''}`}>
                <p className="text-xs text-txt-primary truncate">{user.name}</p>
                <p className="text-[10px] text-txt-tertiary truncate">{user.email}</p>
              </div>
              <Link
                to="/meine-uebersicht"
                className={`relative p-1.5 rounded-sm text-txt-tertiary hover:text-txt-primary hover:bg-bg-elevated transition-colors ${collapsed ? 'md:hidden' : ''}`}
                title="Meine Übersicht"
              >
                <Bell className="w-4 h-4" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-scnat-red text-white text-[9px] font-bold leading-none animate-pulse shadow-sm shadow-scnat-red/40">
                    {notifCount}
                  </span>
                )}
              </Link>
            </div>
          )}

          <Link
            to="/meine-uebersicht"
            title="Meine Übersicht"
            className={`relative w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-sm transition-colors mb-1 ${
              collapsed ? 'md:justify-center md:px-0 md:py-2 md:gap-0' : ''
            } ${
              notifCount > 0 && location.pathname !== '/meine-uebersicht'
                ? 'bg-scnat-red/10 text-scnat-red border border-scnat-red/20 hover:bg-scnat-red/15'
                : location.pathname === '/meine-uebersicht'
                  ? 'bg-bg-elevated text-txt-primary border border-bd-default'
                  : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-elevated border border-transparent'
            }`}
          >
            <span className="relative shrink-0">
              <UserCircle className="w-3.5 h-3.5" />
              {collapsed && notifCount > 0 && (
                <span className="hidden md:flex absolute -top-1.5 -right-1.5 items-center justify-center w-3.5 h-3.5 rounded-full bg-scnat-red text-white text-[7px] font-bold leading-none">
                  {notifCount}
                </span>
              )}
            </span>
            <span className={collapsed ? 'md:hidden' : ''}>Meine Übersicht</span>
            {notifCount > 0 && (
              <span className={`ml-auto flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-scnat-red text-white text-[10px] font-bold leading-none ${collapsed ? 'md:hidden' : ''}`}>
                {notifCount}
              </span>
            )}
          </Link>

          {user?.role === 'admin' && (
            <Link
              to="/cp"
              title="Control Panel"
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-scnat-red hover:text-scnat-red/80 rounded-sm hover:bg-scnat-red/10 transition-colors mb-1 ${
                collapsed ? 'md:justify-center md:px-0 md:py-2 md:gap-0' : ''
              }`}
            >
              <Settings className="w-3.5 h-3.5 shrink-0" />
              <span className={collapsed ? 'md:hidden' : ''}>Control Panel</span>
            </Link>
          )}

          <button
            onClick={handleLogout}
            title="Abmelden"
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-txt-tertiary hover:text-txt-secondary rounded-sm hover:bg-bg-elevated transition-colors ${
              collapsed ? 'md:justify-center md:px-0 md:py-2 md:gap-0' : ''
            }`}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className={collapsed ? 'md:hidden' : ''}>Abmelden</span>
          </button>
        </div>

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

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center p-2.5 border-t border-bd-faint text-txt-tertiary hover:text-txt-primary hover:bg-bg-elevated transition-colors"
          title={collapsed ? 'Sidebar ausklappen' : 'Sidebar einklappen'}
        >
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </button>
      </aside>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
