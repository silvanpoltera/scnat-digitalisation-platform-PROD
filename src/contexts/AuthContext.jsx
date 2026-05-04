import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.user) setUser(data.user); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    let res;
    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error('Server nicht erreichbar. Bitte Verbindung prüfen und nochmal versuchen.');
    }

    // Robust gegen Non-JSON-Antworten (z.B. Wartungs-HTML während Deployment)
    const text = await res.text();
    let data = {};
    if (text) {
      try { data = JSON.parse(text); }
      catch {
        if (res.status === 503 || /maintenance|wartung/i.test(text)) {
          throw new Error('Plattform wird gerade aktualisiert. Bitte in einem Moment nochmal versuchen.');
        }
        throw new Error(`Server-Fehler (${res.status}). Bitte später erneut versuchen.`);
      }
    }
    if (!res.ok) throw new Error(data.error || 'Login fehlgeschlagen');
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
