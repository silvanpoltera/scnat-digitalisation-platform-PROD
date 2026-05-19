const CACHE_NAME = 'scnat-portal-v4';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/scnat-icon.png',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.url.includes('/api/')) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
      return cached || fetched;
    })
  );
});

// ─── Web Push ────────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { title: 'SCNAT Portal', body: event.data ? event.data.text() : '' };
  }

  const {
    title = 'SCNAT Portal',
    body = '',
    url = '/',
    tag,
    badgeCount,
  } = data;

  event.waitUntil((async () => {
    await self.registration.showNotification(title, {
      body,
      tag,
      icon: '/pwa-icon-192.png',
      badge: '/pwa-icon-192.png',
      data: { url },
      renotify: !!tag,
    });

    if (typeof badgeCount === 'number' && 'setAppBadge' in self.navigator) {
      try { await self.navigator.setAppBadge(badgeCount); } catch (_) {}
    } else if ('setAppBadge' in self.navigator) {
      try { await self.navigator.setAppBadge(); } catch (_) {}
    }

    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientsList) {
      try { client.postMessage({ type: 'push-received', payload: data }); } catch (_) {}
    }
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url || '/';

  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const sameOrigin = all.find(c => new URL(c.url).origin === self.location.origin);
    if (sameOrigin) {
      try { await sameOrigin.focus(); } catch (_) {}
      try { await sameOrigin.navigate(target); } catch (_) {}
      return;
    }
    await self.clients.openWindow(target);
  })());
});

self.addEventListener('pushsubscriptionchange', (event) => {
  // The browser invalidated the subscription. We notify any open clients
  // so they can re-subscribe via /api/push/subscribe on next interaction.
  event.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientsList) {
      try { client.postMessage({ type: 'push-subscription-change' }); } catch (_) {}
    }
  })());
});
