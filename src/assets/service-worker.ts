/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;
export default null;

import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

const STATUS_CODES = {
  Opaque: 0,
  OK: 200,
} as const;

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
        statuses: [STATUS_CODES.Opaque, STATUS_CODES.OK],
      }),
      new ExpirationPlugin({
        maxEntries: 30,
      }),
    ],
  })
);
