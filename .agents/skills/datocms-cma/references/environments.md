# Environments

Covers sandbox environment management: forking, promoting, deleting.

> Endpoint shapes / payloads / TS sigs: `npx datocms cma:docs environments <action>` (add `--expand-types '*'` for full TS definitions). Only what docs don't carry below.

## Mental model

Every project has one **primary** environment (production) and zero or more **sandboxes**. A sandbox is a fork — full copy of schema and content, isolated. Schema/content edits flow primary → sandbox → primary via `fork` then `promote`. Identify primary in a list with `env.meta.primary === true`.

## Fork is asynchronous

`client.environments.fork(sourceId, { id })` kicks off a background job. By default the simplified client polls until the job finishes and returns the new `Environment` — convenient but blocking, sometimes minutes for large projects.

- `immediate_return: true` returns immediately with `meta.status: "creating"` and a `meta.fork_completion_percentage`. Use this when scripting and you want to poll on your own schedule, or when the fork is long enough that holding an HTTP connection open is brittle.
- `fast: true` is faster but **puts the source environment into read-only mode** for the duration. CMS users will see write errors. Don't enable in interactive hours without warning.
- `force: true` is needed alongside `fast: true` if collaborators are actively editing — without it the fork refuses to start.

`destroy()` is also async and irreversible; it nukes schema and content.

## Promote semantics

`client.environments.promote(sandboxId)` swaps roles: the sandbox becomes primary, the old primary is demoted to a sandbox (it is **not deleted** — you keep it as a rollback target until you destroy it).

API tokens are bound to the **role of "primary"**, not to a specific environment id — so after promotion, every token previously hitting the old primary now resolves to the promoted environment. This is the point of the workflow but it surprises people who expect tokens to follow the old environment id.

## Environment-aware client

To target a non-primary environment with every call, pass `environment` to `buildClient`:

```ts
const sandboxClient = buildClient({
  apiToken: process.env.DATOCMS_API_TOKEN!,
  environment: "my-sandbox",
});
```

This is preferable to passing the environment per-call, both because it's less error-prone and because the CMA SDK has no per-call environment override — the environment is fixed at client construction.

## Fork → migrate → promote (CI/CD)

Canonical deployment pattern for schema/data migrations:

1. Build a primary-environment client, fork primary into a uniquely-named sandbox (e.g. `migration-${Date.now()}`).
2. Build a sandbox-scoped client (`environment: sandboxId`) and apply schema mutations / data backfills against it. Test against the sandbox before promoting.
3. Use the original primary client to call `promote(sandboxId)`. The sandbox becomes primary; the old primary remains as a sandbox (clean it up later, or keep one or two as rollbacks).

If a step fails before promotion, just destroy the sandbox — the primary was never touched. This is the property that makes the pattern safe.
