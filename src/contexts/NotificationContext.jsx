import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext({ count: 0, inboxCount: 0, adminCount: 0, refresh: () => {} });

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [inboxCount, setInboxCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);

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

    if (user.role === 'admin') {
      fetch('/api/notifications/admin', { credentials: 'include' })
        .then(r => r.ok ? r.json() : {})
        .then(d => {
          const total = Object.values(d || {}).reduce((s, n) => s + (Number(n) || 0), 0);
          setAdminCount(total);
        })
        .catch(() => setAdminCount(0));
    } else {
      setAdminCount(0);
    }
  }, [user]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const onMessage = (event) => {
      const type = event.data?.type;
      if (type === 'push-received') {
        refresh();
      } else if (type === 'push-subscription-change') {
        import('@/lib/pushSubscription').then(m => m.syncExistingSubscription?.());
      }
    };
    navigator.serviceWorker.addEventListener('message', onMessage);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      navigator.serviceWorker.removeEventListener('message', onMessage);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [refresh]);

  const markSeen = useCallback(() => {
    setCount(0);
    fetch('/api/notifications/seen', { method: 'POST', credentials: 'include' }).catch(() => {});
  }, []);

  const totalCount = count + inboxCount;

  useEffect(() => {
    if (!('setAppBadge' in navigator)) return;
    const badgeTotal = totalCount + adminCount;
    if (badgeTotal > 0) {
      navigator.setAppBadge(badgeTotal).catch(() => {});
    } else {
      navigator.clearAppBadge().catch(() => {});
    }
  }, [totalCount, adminCount]);

  return (
    <NotificationContext.Provider value={{ count: totalCount, inboxCount, adminCount, refresh, markSeen }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
