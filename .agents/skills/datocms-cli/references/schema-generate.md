# Schema Generation

Generate TypeScript schema definitions directly from the CLI. Use this when the task is the command invocation itself or when the user needs to scope the generated file to a specific environment or set of item types.

## Inputs to confirm before running commands

Confirm these inputs when they are not already clear:

- output file path
- full schema vs narrowed `--item-types`
- target environment when sandbox-specific types are needed

## Core command

```bash
npx datocms schema:generate src/lib/datocms/cma-types.ts
```

## Useful flags

- `--environment <name>` — Generate the file from a sandbox or staging environment instead of the primary environment
- `--item-types article,author` — Include only the listed item types (and their dependencies — e.g., linked models are pulled in automatically)
- `--profile <name>` or `--api-token <token>` — Select credentials the same way as other CLI commands
- `DATOCMS_PROFILE` / `DATOCMS_<PROFILE_ID>_PROFILE_API_TOKEN` — Use the same profile-selection rules described in the CLI setup reference

## Guidance

- Generate into an existing app or library path, not the repository root, unless the repo already keeps generated types there
- Keep the command in package scripts when the team will rerun it regularly
- Pair with `datocms-cma` only when the follow-up task is to consume the generated types in code
