# Service Worker

**Implement Service Worker using our own Astro Integration with Workbox modules for maximum control.**

- Date: 2025-01-11
- Alternatives Considered: existing integrations [`astrojs-service-worker`](https://github.com/tatethurston/astrojs-service-worker) and [`zastro-service-worker`](https://github.com/zachhandley/astro-service-worker)
- Decision Made By: [Declan](https://github.com/decrek), [Jurgen](https://github.com/jurgenbelien), [Jasper](https://github.com/jbmoelker)

## Decision

Known existing Astro integrations for Service Workers are [`astrojs-service-worker`](https://github.com/tatethurston/astrojs-service-worker) and [`zastro-service-worker`](https://github.com/zachhandley/astro-service-worker). These integrations both use [`generateSW` from `workbox-build`](https://developer.chrome.com/docs/workbox/modules/workbox-build#generatesw), which only allows modifying the service worker through configuration.

To give developers using Head Start more control over their service worker we've decided add our own [Astro Integration](../../config/astro/service-worker-integration.ts) which uses an actual file as a source ([`assets/service-worker.ts`](../../src/assets/service-worker.ts)) which developers can customise. By using low-level [Workbox modules](https://developer.chrome.com/docs/workbox/modules) this control is extended further.
