/// <reference lib="webworker" />
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

((self: ServiceWorkerGlobalScope) => {
  self.addEventListener('install', () => {
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
  });

  registerRoute(
    ({ request }) => request.mode === 'navigate',
    new NetworkFirst({
      networkTimeoutSeconds: 3,
      cacheName: 'pages',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 30,
        }),
      ],
    })
  );
})(self as unknown as ServiceWorkerGlobalScope);
