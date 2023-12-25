# Preview SSR Branch

**Use a git `preview` branch for deployments with run-time rendering enabled to preview content.**

- Date: 2023-11-18
- Alternatives Considered: Secondary Cloudflare Pages instance for preview deployments
- Decision Made By: [Jasper](https://github.com/jbmoelker)

## Decision

Astro renders pages server-side either during build- or run-time. To reduce the number of moving parts and to optimise performance in production, we've set Astro to `output: 'hybrid'` by default. This renders all pages to static HTML files, while offering dynamic API endpoints at the same time. This does mean that every content change requires a new deployment to build new static HTML files.

For editors who quickly want to preview content changes this setup doesn't work. It would mean they'd have to wait for the deployment for every content change. And even if that would be just a draft, changes would directly be public to all website visitors. So instead, editors need a preview mode.

Astro offers `output: 'server'` to compile the website to dynamic endpoints that render pages on-demand during run-time. As explained above we prefer `hybrid` for production. So `server` should only be applied to specific deployments. The two ways we could think of to achieve this for specific deployments were: a secondary Cloudflare Pages instance that would be linked to the same DatoCMS instance and GitHub repository, but would always output to `server`, or pre-defined branch(es) within Head Start that would use the `server` output. A secondary Cloudflare Pages instance introduces more moving parts, and requires manual configuration for every project (like setting environment variables and disconnecting deploy previews). Whereas we found the predefined git branches could use all the same settings and could automatically be kept in sync with the `main` branch using a GitHub Action. So we decided to use that option.
