import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const VisibilityContext = createContext({
  portal: [],
  cp: [],
  isVisible: () => true,
  refresh: () => {},
  ready: false,
});

const DEFAULT_PORTAL_KEYS = [
  'home', 'strategie', 'handlungsfelder', 'massnahmen', 'sprints',
  'systemlandschaft', 'ki-hub', 'schulungen', 'software-antraege',
  'scnat-db', 'meine-uebersicht', 'prozesse', 'team', 'faqs', 'glossar',
];

const DEFAULT_CP_KEYS = [
  'cp-dashboard', 'cp-live-infos', 'cp-news', 'cp-nachrichten',
  'cp-content', 'cp-events', 'cp-antraege', 'cp-users', 'cp-changes',
  'cp-massnahmen', 'cp-sprints', 'cp-themen', 'cp-scnat-db',
  'cp-sichtbarkeit', 'cp-admin-stuff',
];

function normalize(raw) {
  if (raw && Array.isArray(raw.portal) && Array.isArray(raw.cp)) {
    return { portal: raw.portal, cp: raw.cp };
  }

  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return {
      portal: DEFAULT_PORTAL_KEYS.map(key => ({ key, visible: raw[key] !== false })),
      cp: DEFAULT_CP_KEYS.map(key => ({ key, visible: raw[key] !== false })),
    };
  }

  return {
    portal: DEFAULT_PORTAL_KEYS.map(key => ({ key, visible: true })),
    cp: DEFAULT_CP_KEYS.map(key => ({ key, visible: true })),
  };
}

export function VisibilityProvider({ children }) {
  const [data, setData] = useState({ portal: [], cp: [] });
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    fetch('/api/visibility', { credentials: 'include' })
      .then(r => r.ok ? r.json() : {})
      .then(raw => { setData(normalize(raw)); setReady(true); })
      .catch(() => {
        setData(normalize(null));
        setReady(true);
      });
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const visibilityMap = useMemo(() => {
    const map = {};
    for (const s of data.portal) map[s.key] = s.visible;
    for (const s of data.cp) map[s.key] = s.visible;
    return map;
  }, [data]);

  const isVisible = useCallback((key) => visibilityMap[key] !== false, [visibilityMap]);

  return (
    <VisibilityContext.Provider value={{
      portal: data.portal,
      cp: data.cp,
      isVisible,
      refresh,
      ready,
    }}>
      {children}
    </VisibilityContext.Provider>
  );
}

export function useVisibility() {
  return useContext(VisibilityContext);
}
