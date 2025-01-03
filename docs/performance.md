# Performance

**Head Start is built with performance-minded technology and introduces additional performance patterns. In addition we have some tips to further tune the performance of your specific project.**

## ...

Why Astro is selected, zero JS by default
Pre rendering with Cloudflare
Runtime rendering on Cloudflare edge workers
DatoCMS image service features
Use of facade patterns for video embeds
Assets caching (Cache static assets #197)
Pre-connect origins (Pre-connect to DatoCMS Assets domain #200)
Service worker (Add Service Worker #199)
Astro prefetch (Configure Astro prefetch behaviour #201)
Runtime caching (Cache runtime routes (ISR) #198)
Advise 3rd party scripts in workers using Partytown (Plausible example)

link PerfHead?

## Tip: add a service worker

## Tip: add Astro prefetch

## Tip: cache runtime routes

## Tip: load 3rd party scripts in workers

Most 3rd party modules are installed via npm and bundled as our own application code. We have fine grained control over the version of each module, when, how and what part we import. However most projects will inevitably need to load 3rd party scripts (like analytics) during runtime from 3rd party domains. For those 3rd party scripts we advice to use Partytown.
