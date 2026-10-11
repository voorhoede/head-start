# Preview as a second Worker

**Deploy the preview from `main` to a second Cloudflare Worker, switched on with `HEAD_START_PREVIEW=true`, instead of from a `preview` git branch.**

- Date: 2026-10-11
- Alternatives Considered: `preview` git branch deployed as a Workers preview alias (`wrangler versions upload --preview-alias`)
- Decision Made By: [Jasper](https://github.com/jbmoelker)
- Supersedes: [Preview SSR Branch](./2023-11-18-preview-ssr-branch.md)

## Decision

The [preview SSR branch](./2023-11-18-preview-ssr-branch.md) relied on Cloudflare Pages deploying every branch to its own stable URL. After the [move to Workers](./2026-07-03-pages-to-workers.md) that no longer holds: a Worker has one production deployment, and non-production branches only get version previews, which do not support the build variables, deploy hooks and DatoCMS build triggers a preview deployment needs.

So the preview is a second Worker (`head-start-preview`), connected to the same repository and built from `main` like production. Its build variables `HEAD_START_PREVIEW=true` (see [`config/preview.ts`](../../config/preview.ts)) and `CLOUDFLARE_ENV=preview` (the `[env.preview]` section in [`wrangler.toml`](../../wrangler.toml)) make it render on demand with draft content and deploy to its own Worker. This replaces the `preview` branch and the GitHub Action that kept it in sync with `main`. The extra one-off configuration per project is described in [`docs/preview-mode.md`](../preview-mode.md#enable-preview-mode).

As both Workers build `main`, DatoCMS build triggers are matched on `branch` and `env` in their payload.
