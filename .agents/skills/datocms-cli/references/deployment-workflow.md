# Deployment Workflow

Maintenance mode, safe deployment sequences, and CI/CD integration.

## Contents

- Inputs to confirm before running commands
- Maintenance Mode
- Safe Deployment Sequence
- Local Development Workflow
- CI/CD Integration

## Inputs to confirm before running commands

Confirm these inputs when they are not already clear:

- CLI profile to use
- destination environment naming convention
- whether maintenance mode is acceptable for this release
- whether promotion is manual-after-review or automatic in the proposed workflow
- whether `--fast-fork` / `--force` are acceptable operationally

## Maintenance Mode

### Turn on maintenance mode

```bash
npx datocms maintenance:on
```

Flags:

| Flag | Type | Description |
| - | - | - |
| `--force` | boolean | Activate even if users are currently editing records |

When maintenance mode is active, the DatoCMS editing interface is locked and editors cannot make content changes.

Use `--force` only as an explicit override when you understand that active editing sessions may be interrupted.

### Turn off maintenance mode

```bash
npx datocms maintenance:off
```

## Safe Deployment Sequence

The recommended deployment workflow for production schema changes:

```bash
# 1. Enable maintenance mode to prevent editor conflicts
npx datocms maintenance:on

# 2. Run migrations (fork primary -> new sandbox, apply changes)
npx datocms migrations:run --destination=release-v2

# 3. Verify the migration succeeded (check the new environment)
npx datocms environments:list

# 4. Promote the migrated environment to primary
npx datocms environments:promote release-v2

# 5. Disable maintenance mode
npx datocms maintenance:off
```

If editors are active and the team intentionally accepts the risk, you can add `--force` to the maintenance step.

### Why This Order Matters

1. **Maintenance on** — prevents editors from creating conflicting schema/content changes
2. **Migrate to fork** — keeps the current primary safe if migrations fail
3. **Verify** — check the fork has the expected schema before promoting
4. **Promote** — atomically swap the migrated environment to primary
5. **Maintenance off** — re-enable editing with the new schema in place

## Local Development Workflow

For iterating on migrations during development:

```bash
# 1. Fork primary into a dev sandbox
npx datocms environments:fork main my-feature

# 2. Write your migration
npx datocms migrations:new "add author model" --ts

# 3. Run migration in-place on the sandbox
npx datocms migrations:run --source=my-feature --in-place

# 4. Verify the changes look correct
npx datocms cma:call itemTypes list --environment=my-feature

# 5. If something went wrong, destroy and start over
npx datocms environments:destroy my-feature
```

For rapid iteration, you can destroy and re-fork to reset:

```bash
npx datocms environments:destroy my-feature
npx datocms environments:fork main my-feature
# Edit migration script, then re-run
npx datocms migrations:run --source=my-feature --in-place
```

## CI/CD Integration

Example GitHub Actions workflow for deploying migrations:

```yaml
name: Deploy Migrations
on:
  push:
    branches: [main]
    paths: ['migrations/**']

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci

      - name: Enable maintenance mode
        run: npx datocms maintenance:on
        env:
          DATOCMS_API_TOKEN: ${{ secrets.DATOCMS_API_TOKEN }}

      - name: Run migrations
        run: npx datocms migrations:run --destination=${{ github.sha }}
        env:
          DATOCMS_API_TOKEN: ${{ secrets.DATOCMS_API_TOKEN }}

      - name: Promote environment
        run: npx datocms environments:promote ${{ github.sha }}
        env:
          DATOCMS_API_TOKEN: ${{ secrets.DATOCMS_API_TOKEN }}

      - name: Disable maintenance mode
        run: npx datocms maintenance:off
        env:
          DATOCMS_API_TOKEN: ${{ secrets.DATOCMS_API_TOKEN }}
        if: always()
```

Add `--force` to the maintenance step only when the release process explicitly accepts the active-editor risk.

### Key CI/CD Considerations

- **Always** run `maintenance:off` in an `if: always()` step to avoid leaving the project locked if a step fails
- Use the git SHA or a build ID as the `--destination` name for traceability
- Store `DATOCMS_API_TOKEN` as a repository secret
- Trigger only on changes to the `migrations/` directory to avoid unnecessary runs
