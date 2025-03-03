/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;
export default null;

import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { NetworkFirst } from 'workbox-strategies';
import { registerRoute } from 'workbox-routing';
import { setCacheNameDetails } from 'workbox-core';

// be careful not to import the whole package.json, as it will be included in the final bundle
import { name } from '@root/package.json';

const STATUS_CODES = {
  Opaque: 0,
  OK: 200,
} as const;

setCacheNameDetails({
  prefix: name,
  suffix: 'v1',
});

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
