const CACHE_NAME = 'oms-v1';
// No pre-cached assets — manifest/icons are handled by browser HTTP cache natively.
// SW only handles runtime caching of Next.js static chunks.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Navigation: network first, fall back to shell
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
    return;
  }

  // 2. Ignore non-GET
  if (event.request.method !== 'GET') return;

  // 3. Ignore API calls (managed by Zustand + WebSockets)
  if (url.pathname.startsWith('/api/')) return;

  // 4. Ignore backend origin entirely — images/uploads served from Express
  //    must use HTTP cache headers (Cache-Control), not SW cache.
  //    This stops office_image.webp calls appearing on every navigation.
  const backendOrigin = 'localhost:5000';
  if (url.host === backendOrigin || url.hostname === backendOrigin.split(':')[0]) return;

  // 5. Ignore manifest.json and icons — browser handles these natively via HTTP cache
  if (url.pathname === '/manifest.json' || url.pathname.startsWith('/icons/')) return;

  // 6. Cache-first for Next.js static chunks only
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});

self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png', // Fallback icon
      badge: '/icons/badge-72x72.png', // Fallback badge
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/dashboard/notifications'
      },
      actions: [
        {
          action: 'view',
          title: 'View Detail'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    const urlToOpen = event.notification.data.url;
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});
