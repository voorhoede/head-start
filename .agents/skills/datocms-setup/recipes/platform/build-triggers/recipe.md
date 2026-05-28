_Internal recipe for `datocms-setup`. Use this file only after the parent skill selects the `build-triggers` recipe and queues any prerequisites from `../../../references/recipe-manifest.json`._

# DatoCMS Build Triggers Setup

You are an expert at setting up lean, repeatable DatoCMS build-trigger management. This recipe replaces older one-off build-trigger helpers with a single declarative config plus sync and smoke-check scripts.

See `../../../patterns/OUTPUT_STATUS.md` for output status definitions.

Follow these steps in order. Do not skip steps.

## Contents

- Step 1: Detect Context (silent)
- Step 2: Ask Questions
- Step 3: Load References
- Step 4: Generate Code
- Step 5: Next Steps
- Verification Checklist

## Step 1: Detect Context (silent)

Silently examine the project:

Follow the shared repo inspection conventions in `../../../references/repo-conventions.md`, then inspect the recipe-specific signals below.

1. **Node project** — Confirm `package.json` exists
2. **CMA client package** — Check for `@datocms/cma-client`, `@datocms/cma-client-node`, or `@datocms/cma-client-browser`
3. **Existing trigger setup**
   - New config: `scripts/datocms-build-triggers.config.mjs`
   - New helpers: `scripts/datocms-sync-build-triggers.mjs`, `scripts/datocms-build-triggers-smoke.mjs`
   - Old helper names to migrate in place: `scripts/datocms-build-trigger-smoke.mjs`, `package.json` script `datocms:build-trigger:smoke`
4. **Provider signals**
   - Vercel: `.vercel/project.json`, `vercel.json`, or env vars such as `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID`, `VERCEL_DEPLOY_HOOK_URL`, `VERCEL_TOKEN`
   - Netlify: `netlify.toml` or env vars such as `NETLIFY_SITE_ID`, `NETLIFY_BUILD_HOOK_URL`, `NETLIFY_ACCESS_TOKEN`
   - GitLab: `.gitlab-ci.yml` or env vars such as `GITLAB_TRIGGER_URL`, `GITLAB_TRIGGER_TOKEN`, `GITLAB_TRIGGER_REF`
   - Custom: existing deploy-hook env vars such as `DEPLOY_HOOK_URL`, `CUSTOM_BUILD_TRIGGER_URL`, or an existing custom trigger config
5. **Public frontend URL** — Inspect env files and hosting config for a live `SITE_URL` or equivalent public site URL
6. **Existing Dato config** — Inspect env files for a CMA-capable `DATOCMS_API_TOKEN`

### Stop conditions

- If `package.json` is missing, stop and explain that this setup expects a Node project so it can add local sync and smoke-check scripts.
- If an existing trigger-management setup is materially different, inspect it first and patch it in place by default instead of replacing it wholesale.

## Step 2: Ask Questions

Infer first from the repo.

Follow the zero-question default and question-format rules in `../../../patterns/MANDATORY_RULES.md`.

Only ask one explicit question if no `scripts/datocms-build-triggers.config.mjs` exists yet and the repo does not clearly indicate one adapter choice.

In that case, ask:

> "Which starter build-trigger adapter should I scaffold: Vercel, Netlify, GitLab, or Custom? Recommended default: keep the strongest detected provider signal first; if the repo stays ambiguous, fall back to Custom and mark any provider-specific values as `scaffolded`. If you skip, I'll follow that default."

## Step 3: Load References

Read only these references:

- `../../../../datocms-cma/references/client-types-and-behaviors.md`
- `../../../../datocms-cma/references/resource-gotchas.md` (§ Build triggers)
- `../../../../datocms-cma/references/access-control.md`

Also inspect these bundled assets only when generating files:

- `scripts/datocms-sync-build-triggers.mjs`
- `scripts/datocms-build-triggers-smoke.mjs`

## Step 4: Generate Code

Generate only the adapter wiring plus the local management helpers.

### Required project changes

1. **Install a CMA client package** if the project does not already have one
2. **Patch `.env.example`** with:
   - `DATOCMS_API_TOKEN`
   - `SITE_URL` only if the repo does not already expose a public frontend URL
   - adapter-specific private placeholders for every configured trigger
3. **Create or patch `scripts/datocms-build-triggers.config.mjs`**
4. **Create or patch `scripts/datocms-sync-build-triggers.mjs`** from `scripts/datocms-sync-build-triggers.mjs`
5. **Create or patch `scripts/datocms-build-triggers-smoke.mjs`** from `scripts/datocms-build-triggers-smoke.mjs`
6. **Patch `package.json`** with:
   - `datocms:build-triggers:sync`
   - `datocms:build-triggers:smoke`
7. **If older singular helper names exist**, replace them in place with the new plural file and script names

### Config contract

`scripts/datocms-build-triggers.config.mjs` must be the declarative source of truth. Export either:

- a default array of trigger definitions, or
- a default object with `buildTriggers: [...]`

Each trigger definition should use the CMA field names directly:

```js
export default [
  {
    name: 'Production deploy',
    adapter: 'vercel',
    adapter_settings: {
      project_id: process.env.VERCEL_PROJECT_ID ?? '',
      team_id: process.env.VERCEL_TEAM_ID ?? '',
      deploy_hook_url: process.env.VERCEL_DEPLOY_HOOK_URL ?? '',
      token: process.env.VERCEL_TOKEN ?? '',
      branch: process.env.VERCEL_BRANCH ?? 'main',
    },
    frontend_url: process.env.SITE_URL ?? '',
    autotrigger_on_scheduled_publications: true,
    enabled: true,
  },
];
```

### Adapter-specific env placeholders

For `vercel`:

```env
VERCEL_PROJECT_ID=
VERCEL_TEAM_ID=
VERCEL_DEPLOY_HOOK_URL=
VERCEL_TOKEN=
VERCEL_BRANCH=main
```

For `netlify`:

```env
NETLIFY_SITE_ID=
NETLIFY_BUILD_HOOK_URL=
NETLIFY_ACCESS_TOKEN=
NETLIFY_BRANCH=main
```

For `gitlab`:

```env
GITLAB_TRIGGER_URL=
GITLAB_TRIGGER_TOKEN=
GITLAB_TRIGGER_REF=main
```

`build_parameters` can start as an empty object in the generated config unless the repo already has a concrete GitLab parameter mapping.

For `custom`:

```env
CUSTOM_BUILD_TRIGGER_URL=
CUSTOM_BUILD_TRIGGER_AUTH_TOKEN=
```

The generated config can start with `headers: {}` and `payload: {}` when the repo does not already expose a custom deploy payload contract.

### Mandatory rules

- Support all four adapters: `custom`, `gitlab`, `netlify`, and `vercel`
- Sync triggers by name only; never delete unrelated build triggers
- Preserve `frontend_url`
- Default `autotrigger_on_scheduled_publications` to `true`
- Default `enabled` to `true`
- Use Node built-ins only in the helper scripts
- Keep helper scripts compatible with any installed CMA client package by resolving `@datocms/cma-client`, `@datocms/cma-client-node`, or `@datocms/cma-client-browser`
- Do not add CI files, provider SDK dependencies, or queueing infrastructure

### Smoke script contract

`scripts/datocms-build-triggers-smoke.mjs` must support:

1. Listing build triggers
2. Triggering a deploy by build-trigger id or exact name
3. Listing recent build events

Keep the CLI simple, Node-only, and oriented around direct operator checks.

### Output status

- Report `scaffolded` if any configured trigger still depends on placeholder site URLs, adapter ids, branch names, hook URLs, or tokens
- Report `production-ready` only when every configured trigger can be created or updated from real repo values and the smoke-check helper can inspect or trigger them without additional placeholders

## Step 5: Next Steps

After generating the files, tell the user:

1. Which adapters were detected or scaffolded
2. Which env vars still need real values, if any
3. How to run `datocms:build-triggers:sync`
4. How to run `datocms:build-triggers:smoke`
5. Whether the result is still `scaffolded`

Follow the shared final handoff rules in `../../../patterns/OUTPUT_STATUS.md`, including an explicit `Unresolved placeholders` section.

## Verification Checklist

Before presenting the result, verify:

1. `scripts/datocms-build-triggers.config.mjs` exists
2. `scripts/datocms-sync-build-triggers.mjs` exists
3. `scripts/datocms-build-triggers-smoke.mjs` exists
4. `package.json` contains both `datocms:build-triggers:sync` and `datocms:build-triggers:smoke`
5. The sync helper supports `custom`, `gitlab`, `netlify`, and `vercel`
6. The sync helper never deletes unrelated build triggers
7. The smoke helper can list triggers, trigger a deploy by id or name, and list recent build events
8. Old singular helper names are replaced in place when present
9. The result is `scaffolded` unless every configured trigger has real values and can be managed immediately
