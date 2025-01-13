/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;
export default null;

import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

self.addEventListener('install', () => {
  self.skipWaiting();
});
  
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

const addEtagPlugin = {
  cacheWillUpdate: async ({ response }: { response?: Response }) => {
    if (!response) return null;
    
    const clonedResponse = response.clone();
    
    // If response already has an ETag, return it unchanged
    if (clonedResponse.headers.has('etag')) {
      return clonedResponse;
    }
    
    // Generate ETag from response content
    const content = await clonedResponse.clone().text();
    const hash = await crypto.subtle.digest(
      'SHA-1',
      new TextEncoder().encode(content)
    );
    const etag = Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Create new response with ETag header
    const newHeaders = new Headers(clonedResponse.headers);
    newHeaders.set('etag', `"${etag}"`);

    return new Response(content, {
      status: clonedResponse.status,
      statusText: clonedResponse.statusText,
      headers: newHeaders,
    });
  }
};

registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    networkTimeoutSeconds: 3,
    cacheName: 'pages',
    plugins: [
      addEtagPlugin,
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 30,
      }),
    ],
  })
);
