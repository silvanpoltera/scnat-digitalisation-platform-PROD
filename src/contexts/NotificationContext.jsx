import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext({ count: 0, inboxCount: 0, refresh: () => {} });

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [inboxCount, setInboxCount] = useState(0);

  const refresh = useCallback(() => {
    if (!user) return;
    fetch('/api/notifications/count', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { count: 0 })
      .then(d => setCount(d.count || 0))
      .catch(() => setCount(0));

    fetch('/api/inbox/unread-count', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { count: 0 })
      .then(d => setInboxCount(d.count || 0))
      .catch(() => setInboxCount(0));
  }, [user]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const markSeen = useCallback(() => {
    setCount(0);
    fetch('/api/notifications/seen', { method: 'POST', credentials: 'include' }).catch(() => {});
  }, []);

  const totalCount = count + inboxCount;

  useEffect(() => {
    if (!('setAppBadge' in navigator)) return;
    if (totalCount > 0) {
      navigator.setAppBadge(totalCount).catch(() => {});
    } else {
      navigator.clearAppBadge().catch(() => {});
    }
  }, [totalCount]);

  return (
    <NotificationContext.Provider value={{ count: totalCount, inboxCount, refresh, markSeen }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
