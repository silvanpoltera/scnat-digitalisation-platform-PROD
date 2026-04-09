import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext({ count: 0, refresh: () => {} });

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    if (!user) return;
    fetch('/api/notifications/count', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { count: 0 })
      .then(d => setCount(d.count || 0))
      .catch(() => setCount(0));
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

  return (
    <NotificationContext.Provider value={{ count, refresh, markSeen }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
