# Project Settings and Usage

Covers project-level configuration and introspection: site, maintenance mode, public info, white-label, subscription limits/features, daily usage, usage counters.

> Endpoint shapes / payloads / TS sigs: `npx datocms cma:docs {site|maintenanceMode|publicInfo|whiteLabelSettings|subscriptionLimits|subscriptionFeatures|dailyUsages|usageCounters} <action>` (add `--expand-types '*'` for full TS definitions). Only what docs don't carry below.

## `site.locales` — order is meaning

`site.locales` is an ordered array, not a set. The **first element is the primary locale** for the project. Two operational consequences that surprise:

- **Reordering the array changes which locale is primary.** A diff that looks like cosmetic shuffling (`["en", "it", "fr"]` → `["it", "en", "fr"]`) is a primary-locale switch with all the implications (default for new records, the locale used by `filter.query` when `locale` isn't passed, etc.).
- **Adding a locale does not backfill content.** New locale entries are added to the project but every existing record still has empty values for that locale — and unless the new locale is added to all required fields' validators, those records may silently become invalid. Run a backfill or update validators alongside the locale add.

## Maintenance mode and `force`

`client.maintenanceMode.activate()` puts the **primary** environment into read-only mode. CMS users see write errors; API CMA writes against primary fail. Use it as the "freeze" half of a controlled promote:

1. `maintenanceMode.activate()` — block writes to primary.
2. `environments.promote(sandboxId)` — atomic swap.
3. `maintenanceMode.deactivate()` — unfreeze the new primary.

Step 1 fails by default if collaborators are editing records. Pass `{ force: true }` to override — only safe if you've coordinated with the team or you're certain no one is in an editing session, since their unsaved work is lost.

## Subscription limits and features as pre-flight checks

Plan limits (records, uploadable_bytes, item_types, fields) and feature flags (sso, workflows, localization) are the canonical way to pre-check before bulk operations or before writing automation that depends on a gated feature.

```ts
const recordsLimit = await client.subscriptionLimits.find("records");
if (recordsLimit.limit !== null && recordsLimit.usage + plannedInserts > recordsLimit.limit) {
  throw new Error("would exceed plan record limit");
}
```

Cheaper and clearer than catching the `LIMIT_REACHED` error after the fact. Useful pattern when scripting migrations: list both, filter for what's near capacity, fail fast.

`subscriptionFeatures` `enabled: false` means the API will reject calls that depend on the feature — check before scripting against SSO endpoints, workflow transitions, or locale operations on plans where they're gated.

## White-label is Enterprise-only

`whiteLabelSettings.find()` / `update()` and the white-label fields on `publicInfo` are Enterprise-plan features. On any other plan the call returns 403 (or similar) — gate scripts with a `subscriptionFeatures` check first when they're meant to run across multiple projects of varying plans.

## `usageCounters` vs `dailyUsages`

Two separate resources for two different needs:

- `usageCounters.find(id, { period })` — **current** counter value with `period: "today" | "current_month" | "last_month"`. Use for real-time quota dashboards or alerting.
- `dailyUsages.list()` — historical per-day breakdown (CDA/CMA calls, traffic bytes, Mux video seconds). Use for trend analysis, billing reconciliation. Returns one entry per day; there's no built-in date-range filter, so client-filter by `entry.date` after fetching.

The two don't overlap — neither contains the other's data — so reach for the one that matches the question you're answering.
