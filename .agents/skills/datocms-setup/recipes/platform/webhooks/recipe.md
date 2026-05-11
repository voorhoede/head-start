_Recipe for `datocms-setup`. Use after parent skill selects `webhooks` recipe and queues prerequisites from `../../../references/recipe-manifest.json`._

# DatoCMS Webhooks Setup

Expert at lean, repeatable DatoCMS webhook management. Adds declarative webhook config, sync helper, and minimal authenticated receiver endpoint when supported.

See `../../../patterns/OUTPUT_STATUS.md` for output status definitions.

Follow steps in order. Do not skip.

## Contents

- Step 1: Detect Context (silent)
- Step 2: Ask Questions
- Step 3: Load References
- Step 4: Generate Code
- Step 5: Next Steps
- Verification Checklist

## Step 1: Detect Context (silent)

Silently examine project:

Follow shared repo inspection conventions in `../../../references/repo-conventions.md`, then inspect recipe-specific signals below.

1. **Node project** — Confirm `package.json` exists
2. **Framework and file layout** — use `../../../references/repo-conventions.md` for supported framework detection and `src/` usage when local receiver in scope
3. **CMA client package** — Check for `@datocms/cma-client`, `@datocms/cma-client-node`, or `@datocms/cma-client-browser`
4. **Existing webhook setup**
   - `scripts/datocms-webhooks.config.mjs`
   - `scripts/datocms-sync-webhooks.mjs`
   - `package.json` script `datocms:webhooks:sync`
5. **Existing receiver endpoint**
   - Next.js: `src/app/api/datocms/webhook/route.ts` or `app/api/datocms/webhook/route.ts`
   - Nuxt: `server/api/datocms/webhook.post.ts`
   - SvelteKit: `src/routes/api/datocms/webhook/+server.ts`
   - Astro: `src/pages/api/datocms/webhook.ts`
6. **Public frontend URL** — Inspect env files or existing project config for usable site URL
7. **Existing Dato config** — Inspect env files for CMA-capable `DATOCMS_API_TOKEN`

### Stop conditions

- If `package.json` missing, stop: setup expects Node project for local sync helper
- If existing webhook-management setup differs materially, inspect first then patch in place by default instead of replacing wholesale
- If no supported framework detected, continue with CMA-side webhook setup only; explicitly say receiver scaffolding out of scope for this repo

## Step 2: Ask Questions

Infer first from repo.

Follow zero-question default and question-format rules in `../../../patterns/MANDATORY_RULES.md`.

Only ask one explicit question if no `scripts/datocms-webhooks.config.mjs` exists yet.

In that case, ask:

> "Which starter webhook template should I scaffold: content events, schema or admin events, or build or deploy events? Recommended default: content events for new baseline setup. If you skip, I'll scaffold content events and mark any receiver-specific behavior as `scaffolded` until real values or handlers filled in."

## Step 3: Load References

Read only these references:

- `../../../../datocms-cma/references/client-types-and-behaviors.md`
- `../../../../datocms-cma/references/resource-gotchas.md` (§ Webhooks)
- `../../../../datocms-cma/references/access-control.md`

If supported framework present and local receiver should be scaffolded, also load matching framework reference:

| Framework | Reference file |
| - | - |
| Next.js | `../../../../datocms-frontend-integrations/references/nextjs.md` |
| Nuxt | `../../../../datocms-frontend-integrations/references/nuxt.md` |
| SvelteKit | `../../../../datocms-frontend-integrations/references/sveltekit.md` |
| Astro | `../../../../datocms-frontend-integrations/references/astro.md` |

Also inspect bundled asset only when generating files:

- `scripts/datocms-sync-webhooks.mjs`

## Step 4: Generate Code

Generate declarative webhook config, sync helper, and optional local receiver.

### Required project changes

1. **Install CMA client package** if project does not already have one
2. **Patch `.env.example`** with:
   - `DATOCMS_API_TOKEN`
   - one shared webhook secret placeholder using framework conventions when local receiver scaffolded
   - `SITE_URL` only if repo does not already expose usable public URL
3. **Create or patch `scripts/datocms-webhooks.config.mjs`**
4. **Create or patch `scripts/datocms-sync-webhooks.mjs`** from `scripts/datocms-sync-webhooks.mjs`
5. **Patch `package.json`** with `datocms:webhooks:sync`
6. **When supported framework present and generated config points to site-local receiver**, scaffold one minimal authenticated endpoint at:
   - Next.js: `src/app/api/datocms/webhook/route.ts` or `app/api/datocms/webhook/route.ts`
   - Nuxt: `server/api/datocms/webhook.post.ts`
   - SvelteKit: `src/routes/api/datocms/webhook/+server.ts`
   - Astro: `src/pages/api/datocms/webhook.ts`

### Shared secret env conventions

- Next.js: `DATOCMS_WEBHOOK_SECRET`
- Nuxt: `NUXT_DATOCMS_WEBHOOK_SECRET`
- SvelteKit: `PRIVATE_DATOCMS_WEBHOOK_SECRET`
- Astro: `DATOCMS_WEBHOOK_SECRET`

### Config contract

`scripts/datocms-webhooks.config.mjs` must be declarative source of truth. Export either:

- default array of webhook definitions, or
- default object with `webhooks: [...]`

Each webhook definition should use CMA field names directly:

```js
export default [
  {
    name: 'Local content events receiver',
    url: new URL('/api/datocms/webhook', process.env.SITE_URL ?? 'http://localhost:3000').toString(),
    headers: {
      Authorization: `Bearer ${process.env.DATOCMS_WEBHOOK_SECRET ?? ''}`,
    },
    events: [
      {
        entity_type: 'item',
        event_types: ['create', 'update', 'delete', 'publish', 'unpublish'],
      },
    ],
    custom_payload: null,
    http_basic_user: null,
    http_basic_password: null,
    enabled: true,
    payload_api_version: '3',
    nested_items_in_payload: false,
    auto_retry: true,
  },
];
```

### Starter templates

Use one starter webhook definition when no config exists yet:

- `content events`
  - one local receiver webhook for `item` events: `create`, `update`, `delete`, `publish`, `unpublish`
- `schema/admin events`
  - one webhook for `item_type`, `environment`, and `maintenance_mode` changes
- `build/deploy events`
  - one webhook for `build_trigger` events: `deploy_started`, `deploy_succeeded`, `deploy_failed`

### Mandatory rules

- Sync helper must create or update webhooks by name only
- Sync helper must never delete unrelated webhooks
- Preserve `payload_api_version: "3"`
- Default `custom_payload` to `null`
- Default `auto_retry` to `true`
- Use Node built-ins only in helper script
- Keep helper compatible with any installed CMA client package by resolving `@datocms/cma-client`, `@datocms/cma-client-node`, or `@datocms/cma-client-browser`
- Generated receiver must:
  - validate shared secret
  - parse JSON body
  - return quickly
  - expose clearly marked project-specific handler stub
- Do not generate cache invalidation, preview routing, queueing logic, or other project-specific business logic in this skill

### Output status

- Report `scaffolded` if `SITE_URL`, webhook secret, or any receiver stub behavior still uses placeholders
- Report `production-ready` only when webhook definitions use real values and any generated local receiver has intentional project-specific handling

## Step 5: Next Steps

After generating files, tell user:

1. Which webhook template was scaffolded or updated
2. Which env vars still need real values, if any
3. How to run `datocms:webhooks:sync`
4. Whether any generated local receiver is still generic stub
5. Whether result is still `scaffolded`

Follow shared final handoff rules in `../../../patterns/OUTPUT_STATUS.md`, including explicit `Unresolved placeholders` section.

## Verification Checklist

Before presenting result, verify:

1. `scripts/datocms-webhooks.config.mjs` exists
2. `scripts/datocms-sync-webhooks.mjs` exists
3. `package.json` contains `datocms:webhooks:sync`
4. Sync helper creates or updates webhooks by name and never deletes unrelated ones
5. Sync helper preserves `payload_api_version: "3"` and defaults `custom_payload` / `auto_retry` correctly
6. Local receiver scaffolding limited to Next.js App Router, Nuxt, SvelteKit, or Astro
7. Generated receivers validate shared secret, parse JSON, and return quickly
8. Skill does not generate cache invalidation, preview, or queueing logic
9. Result is `scaffolded` unless real values and intentional receiver logic already present
