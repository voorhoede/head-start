# AGENTS.md

Instructions for AI coding agents working in this repository. Human contributors should start with the [README](./README.md) and [`docs/`](./docs/).

## Project overview

Head Start is a starter kit by [De Voorhoede](https://www.voorhoede.nl/en/) for building content-driven **websites** (not web apps) on top of a headless stack:

- **Framework:** [Astro](https://astro.build/) (v5, `output: 'server'` via Cloudflare adapter).
- **CMS:** [DatoCMS](https://www.datocms.com/) — content is fetched via GraphQL; schema is managed through migrations in [`config/datocms/migrations/`](./config/datocms/migrations/).
- **Hosting:** [Cloudflare Pages](https://pages.cloudflare.com/) (Workers runtime). Local preview uses `wrangler`.
- **Philosophy:** no default JS framework, no default styling, progressively enhanced, fully accessible, highly performant. See [README › Philosophy](./README.md#philosophy) before suggesting new dependencies.

The repo is a small monorepo: the root is the Astro app; [`config/datocms/`](./config/datocms/) is an npm workspace for CMS-side tooling.

## Required reading for agents

Skim these before making non-trivial changes:

- [`docs/project-structure.md`](./docs/project-structure.md) — where things live.
- [`docs/blocks-and-components.md`](./docs/blocks-and-components.md) — the Block vs. Component distinction is load-bearing.
- [`docs/cms-data-loading.md`](./docs/cms-data-loading.md) — GraphQL queries/fragments are colocated with pages/blocks.
- [`docs/decision-log/`](./docs/decision-log/) — read the relevant entry before challenging an architectural choice, and add a new entry when making one.

## Agent skills

Project-specific skills live in [`.agents/skills/`](./.agents/skills/). Each skill is a `SKILL.md` file with focused, executable guidance for a domain. Load the relevant skill before working in that area — they contain decisions and patterns already validated for this project.

| Skill | Path | When to load |
| --- | --- | --- |
| `astro` | [`.agents/skills/astro/SKILL.md`](./.agents/skills/astro/SKILL.md) | Working with `.astro` files, SSR config, integrations, or Astro CLI. |
| `datocms` | [`.agents/skills/datocms/SKILL.md`](./.agents/skills/datocms/SKILL.md) | CMS schema, migrations, GraphQL queries, structured text (DAST), webhooks, or environment management. |
| `frontend-design` | [`.agents/skills/frontend-design/SKILL.md`](./.agents/skills/frontend-design/SKILL.md) | Building or styling UI components and pages — follows project aesthetics over generic AI defaults. **Default to Astro components and web standards.** Only use a client-side framework (React, Vue, etc.) or framework-specific library (e.g. Motion for React) if the component being worked on already uses that framework — never introduce one that isn't already present in the surrounding code. |

## MCP servers

A [`.mcp.json`](./.mcp.json) at the repo root configures four MCP servers picked up automatically by Claude Code, Cursor, and other compatible agents:

| Server | Transport | Purpose |
| --- | --- | --- |
| `datocms` | stdio (`@datocms/mcp-server`) | Query and manage CMS schema, records, environments, and assets directly. Requires `DATOCMS_API_TOKEN` in env. |
| `astro-docs` | HTTP (`mcp.docs.astro.build`) | Live access to Astro documentation — ensures up-to-date API references without hallucinating outdated APIs. |
| `cloudflare-docs` | HTTP (`docs.mcp.cloudflare.com`) | Live access to Cloudflare documentation — covers Pages, Workers, and `wrangler` config. |
| `chrome-devtools` | stdio (`chrome-devtools-mcp`) | Drive a real browser for visual QA — navigate pages, inspect the DOM, take screenshots, check console errors. The server launches its own Chrome; point it at the dev server (<http://127.0.0.1:4323>) via the `navigate_page` tool, so run `npm run dev` first. |

> The `DATOCMS_API_TOKEN` env var is read from your shell — never hardcode a token in `.mcp.json`.

## Environment

- Node.js version is pinned in [.node-version](./.node-version) (currently `v25`). Use the matching version.
- Package manager: `npm` (see [package.json](./package.json) `workspaces`). Do not introduce `pnpm`/`yarn` lockfiles.
- Copy [.env.example](./.env.example) to `.env` and fill it in. Most scripts require `DATOCMS_READONLY_API_TOKEN`, `DATOCMS_API_TOKEN`, and `HEAD_START_PREVIEW_SECRET`. Never commit real values.
- A `.dev.vars` file is auto-created by `npm run prep:cloudflare-env` for `wrangler`.

## Build, run, test

Run everything from the repo root:

| Command | Purpose |
| --- | --- |
| `npm install` | Install deps (also runs `husky` hooks install). |
| `npm run dev` | Start Astro dev server at <http://localhost:4323> plus GraphQL/icon/translation watchers in parallel. |
| `npm run build` | Runs `prep` (clean, download CMS data, generate types, build icon sprite) then `astro build`. |
| `npm run preview` | Serve the built `dist/` with `wrangler pages dev` (closest to production). |
| `npm run lint` | Runs `astro check` + ESLint + `html-validate` over `dist/`. `lint:html` requires a build first. |
| `npm run test` / `npm run test:unit` | Vitest unit tests (`*.test.ts`). Depends on `prep`. |
| `npm run analyze` | Build with Sonda bundle analyzer (writes to `reports/`). |
| `npm run create[:block\|:component\|:page\|:api]` | Scaffold new files via Plop; prefer this over hand-creating boilerplate. |
| `npm run cms:*` | DatoCMS environment & migration management (see [`docs/migrations.md`](./docs/migrations.md)). These hit the live CMS — use a non-primary environment. |

Notes:
- `astro check` and `lint:eslint` are the fast feedback loop; `lint:html` needs `npm run build` first or it has nothing to validate.
- Dev port `4323` is intentional (see [astro.config.ts](./astro.config.ts)), not the Astro default `4321`.
- Tests currently cover a subset of the codebase; add a `*.test.ts` next to the code you change when practical.

## Code style

Enforced by [eslint.config.mjs](./eslint.config.mjs) — run `npm run lint:eslint -- --fix` before committing (a `nano-staged` hook does this on staged `*.{astro,js,ts}` files).

- 2-space indent, single quotes, semicolons, spaces inside `{ }`.
- Unused vars/args must be prefixed with `_`.
- TypeScript everywhere; `.astro` components for UI. No non-null assertion restriction, but prefer narrowing.
- Filenames:
  - Blocks and components: `PascalCase/` directory with matching `PascalCase.astro`, plus optional `*.fragment.graphql`, `*.client.ts`, `*.test.ts`, `*.preview.txt|png`.
  - Library/helpers/scripts: `kebab-case.ts`.
  - Pages follow Astro file-system routing under [`src/pages/[locale]/`](./src/pages/).
- Don't edit generated files: `src/lib/datocms/types.ts`, `src/assets/icon-sprite.svg`, anything under `.astro/`, `dist/`, or `functions/` (all ignored by ESLint).
- Prefer Astro components and web standards over adding a UI framework. If a component genuinely needs interactivity, add a sibling `*.client.ts` — see existing blocks for the pattern.

## GraphQL & CMS

- Query files (`*.query.graphql`) live next to the page that uses them; fragment files (`*.fragment.graphql`) live next to their block/component.
- Types are generated by `graphql-codegen` via `npm run prep:datocms-types` (also runs automatically in `dev`/`prebuild`). Re-run it after editing a `.graphql` file.
- CMS schema changes go through migrations: scaffold with `npm run cms:migrations:generate`, test against a fresh environment with `cms:environments:create`, then `cms:environments:promote`. See [`docs/migrations.md`](./docs/migrations.md).
- Adding a new Block: create the block in DatoCMS (model API key = snake_case of the component name), scaffold the frontend with `npm run create:block`, add the fragment, and register it in [`src/blocks/Blocks.astro`](./src/blocks/Blocks.astro).

## Security considerations

- Treat everything in `.env` / `.dev.vars` as a secret. Don't print tokens in logs, commit messages, or error output.
- `DATOCMS_API_TOKEN` has full CMS write access; scripts in [`scripts/`](./scripts/) use it. Avoid invoking them against the primary DatoCMS environment unless explicitly asked.
- `HEAD_START_PREVIEW_SECRET` gates preview mode; rotate it if leaked. See [`docs/preview-mode.md`](./docs/preview-mode.md) and the [preview-ssr-branch decision](./docs/decision-log/2023-11-18-preview-ssr-branch.md).
- All user-facing output must remain XSS-safe — prefer Astro's default escaping and the structured-text renderer over `set:html` unless content is already sanitised CMS output.
- Don't disable ESLint rules, the a11y plugin, or `astro check` to get a build through. Fix the underlying issue.

## Guardrails

Hard rules. If you're unsure whether an action is covered, stop and ask the user.

### Destructive actions — ask first

Never run these without explicit, in-context confirmation from the user (a prior "yes" from a different task does not carry over):

- `rm -rf`, `find … -delete`, or any recursive delete outside `node_modules/`, `dist/`, `.astro/`, `reports/`, or `functions/` (these are safe to wipe).
- `git push --force` / `--force-with-lease`, `git reset --hard` on a branch that has been pushed, `git clean -fdx`, rewriting or amending commits that are already on the remote, deleting branches or tags (local or remote).
- `git checkout .` / `git restore` over uncommitted work you didn't create this session — it may be the user's in-progress changes.
- `npm run cms:environments:destroy`, `cms:environments:promote`, or any `cms:*` script targeting the **primary** DatoCMS environment. Always operate on a fresh non-primary environment unless the user explicitly names the primary one.
- Anything that writes to DatoCMS production content, uploads, or access tokens (including `cms:upload-block-previews` against primary).
- Rotating, printing, or committing secrets from `.env`, `.dev.vars`, or `wrangler` — even redacted.
- Touching Cloudflare Pages settings, deploy hooks, DNS, or repository secrets.
- `npm install <new-dep>` for a runtime dependency, a UI framework, or a styling system — these cut against the [project philosophy](./README.md#philosophy). Dev-only tooling with a clear justification is fine to propose, but confirm before installing.
- `--no-verify` on commits, disabling ESLint/`astro check`, or editing generated files to bypass errors (see [Code style](#code-style)).

Prefer reversible alternatives: work on a feature branch, use a scratch DatoCMS environment, stage changes before deleting, and keep commits small.

### Loop & runaway prevention

If you find yourself repeating the same action, stop and re-plan instead of retrying harder:

- **Three-strike rule.** If the same command, edit, or search fails or produces the same result three times, stop. Summarise what you tried and ask the user — don't escalate (e.g. from `rm` to `rm -rf`, or from a targeted fix to a rewrite) to force progress.
- **Don't fight the tooling.** If `astro check`, ESLint, or `html-validate` keeps flagging the same issue, read the rule and fix the root cause. Do not add `// eslint-disable`, `@ts-ignore`, or `set:html` just to get green.
- **Don't re-run long tasks speculatively.** `npm run build`, `npm run prep`, and `cms:*` scripts are slow and hit the network/CMS. Run them once, read the output, then act — don't loop builds waiting for a different result.
- **Watchers are already running in `dev`.** Don't spawn parallel `astro dev`, `graphql-codegen`, or `chokidar` processes; `npm run dev` covers them via `run-p`.
- **Bounded searches.** Prefer `grep_search` / `file_search` with specific patterns over repeated `semantic_search` passes once you have enough context to act.
- **Fail loudly, not silently.** If a step genuinely can't proceed (missing env var, CMS unreachable, schema drift), surface it to the user with the exact error — don't work around it by mocking data or skipping the step.
- **Stay on-task.** Don't opportunistically refactor, reformat, or "tidy up" files you weren't asked to change; it expands the diff and makes review harder.

## Commit & PR guidelines

- Keep PRs focused; discuss larger changes in an issue first ([CONTRIBUTING](./.github/CONTRIBUTING.md)).
- PRs use [`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md) — fill it in.
- CI runs lint + HTML validation + tests and needs `DATOCMS_API_TOKEN` / `DATOCMS_READONLY_API_TOKEN` repository secrets to be set.
- Record meaningful architectural decisions in [`docs/decision-log/`](./docs/decision-log/) using the existing `YYYY-MM-DD-slug.md` pattern.
- Update [`CHANGELOG.md`](./CHANGELOG.md) for user-visible changes.

## Nuances & known rough edges

Flagging these so agents don't faithfully replicate them:

- **Docs have typos.** [`docs/getting-started.md`](./docs/getting-started.md) contains "Prequisites" (should be "Prerequisites") and "You're project is now deployed" (should be "Your"). [README › Commands](./README.md#commands) describes `lint` as "valide HTML output" (should be "validate"). Fix opportunistically when editing those files, but don't open a PR solely for typo churn.
- **`astro -- --help` hint is misleading.** The README suggests `astro -- --help`; the working invocations are `npm run astro -- --help` or `npx astro --help`.
- **Getting-started seed gap.** [Issue #27](https://github.com/voorhoede/head-start/issues/27) — the project still requires manual creation of SEO / Home / 404 content in DatoCMS after running migrations or the build will fail. Mention this when guiding a new setup.
- **`docs/testing.md` is out of date** (it says e2e is "planned"). Check the repo for whatever is actually wired up before asserting test coverage to the user.
- **Port 4323 vs 4321.** Several third-party docs/snippets assume Astro's default `4321`; Head Start uses `4323`. Don't "fix" this — it's intentional.
- **`lint:html` silently passes on an empty `dist/`.** It only validates files produced by `astro build`, so order matters in CI and local runs.
- **`config/datocms` is a workspace.** Running `npm install` at the root installs it; don't `cd config/datocms && npm install` separately unless you know why.

## When in doubt

Prefer small, reversible changes. Read the nearest doc in [`docs/`](./docs/) and the relevant decision-log entry, then ask the user before making architectural shifts (introducing a UI framework, changing the CMS, adding a global styling system, etc.) — these cut against the project's stated philosophy.
