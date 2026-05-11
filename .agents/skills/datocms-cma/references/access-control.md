# Access Control

Covers roles, API tokens, users, invitations, and SSO.

> **For payloads, field shapes, enums, defaults, and TS sigs, always run `npx datocms cma:docs <resource> [<action>]`** (add `--expand-types '*'` for full TS definitions). Resources here: `roles`, `accessTokens`, `users`, `siteInvitations`, `ssoUsers`, `ssoGroups`, `ssoSettings`. The schema docs are exhaustive — including the permissions model, the discriminated unions on each `positive_*` / `negative_*` entry, inheritance resolution, action enums, environment scoping, and per-resource gotchas. This file only carries operational advice that doesn't fit on a schema page.

## Roles

The biggest footgun is **wholesale array replacement on `roles.update`** — every `positive_*` / `negative_*` array sent in the payload replaces the stored one as a unit, so a naive "patch one entry" update silently erases everything else. Read the role first and forward the entries you don't want to change, or use the `client.roles.updateCurrentEnvironmentPermissions(...)` helper (records + uploads in the current environment only — build trigger / search index / other-environment entries still need a raw `update`). See `cma:docs roles update` for the full warning and the helper signature.

The standard "custom role" recipe is `roles.duplicate` → rename → `update`, not constructing a permission tree from scratch. To make targeted adjustments, prefer a single positive `action: "all"` entry plus `negative_*` entries to subtract — the resolved set lives in `meta.final_permissions` on every role response and is what to read when debugging "why can't this credential do X?".

## API tokens

`regenerateToken` invalidates the previous secret immediately. Schedule the rollout to every consumer (deploys, CI secrets, edge configs, mobile builds) **before** calling it on a production token, otherwise traffic between the rotation and the rollout 401s.

Built-in factory tokens (the seeded read-only API token, etc.) carry a non-null `hardcoded_type` and reject `accessTokens.update` with `NON_EDITABLE_ACCESS_TOKEN`. They can still be deleted and rotated — useful to know when a "normalize all tokens" script trips on them.

## SSO

**`ssoUsers` attributes are managed by the IdP, not the CMA** — there is no `update` action on the resource. First name, last name, email, active status, and group membership all sync from SAML/SCIM; role assignment is the only human-controllable lever, typically driven through group mapping rather than directly per user.

**Always set `ssoGroups.priority` explicitly** when an SSO user can land in multiple groups. The role from the highest-priority group wins; relying on undefined ordering between equal priorities is not stable across requests.

**Set `ssoSettings.default_role` to a low-privilege role** (e.g. read-only). It applies to any new SSO user that doesn't match a group — leaving it as a full editor turns "we forgot to map this group" into a silent privilege escalation.

`client.ssoUsers.copyUsers()` and `client.ssoGroups.copyRoles(groupId)` are one-shot migration helpers — useful when first enabling SSO on a project that already has email-based collaborators, not part of normal operation.
