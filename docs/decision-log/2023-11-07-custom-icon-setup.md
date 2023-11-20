# Use custom icon setup

**Use a custom icon setup using `svg-sprite` (and a `chokidar` watcher).**

- Date: 2023-11-07
- Alternatives Considered: [`astro-icon`](https://github.com/natemoo-re/astro-icon) (incompabitle with Cloudflare Pages hybrid rendering)
- Decision Made By: [Jasper](https://github.com/jbmoelker), [Declan](https://github.com/decrek)

## Decision

We originally decided on using [`astro-icon`](https://github.com/natemoo-re/astro-icon). However we found this package is incompabitle with Cloudflare Pages hybrid rendering. For API routing we need to extend our Astro + Cloudflare Pages setup with the `@astro/cloudflare` adapter and set `output: 'hybrid'` in the Astro config. This fails the build as `astro-icon` uses SVGO during run-time which uses native Node.js modules that are not available in Cloudflare workers. This [issue is known/reported in the `astro-icon` package](https://github.com/natemoo-re/astro-icon/issues/35). So instead we've now decided to use a custom icon setup that only generates the icon sprite during build-time.
