# CLI Plugin Management

Manage extensions to the DatoCMS CLI itself. These are **oclif CLI plugins** (npm packages that add commands to `npx datocms`), **not** DatoCMS project plugins managed via the dashboard or `datocms-plugin-sdk`.

If the user's actual goal is importing content from WordPress or Contentful, load `references/importing-content.md` instead — it covers the specific importer plugins (`@datocms/cli-plugin-wordpress`, `@datocms/cli-plugin-contentful`).

## Contents

- Inputs to confirm before running commands
- List installed plugins
- List official available plugins
- Install a plugin
- Inspect a plugin
- Link a plugin for local development
- Remove a plugin
- Reset all plugins
- Update installed plugins
- Guidance

## Inputs to confirm before running commands

Confirm these inputs when they are not already clear:

- whether the goal is installing an official DatoCMS CLI plugin or a third-party/custom one
- whether the plugin is being developed locally (`plugins:link`) or installed from npm
- whether the action targets all plugins (`reset` / `update`) or a specific one

## List installed plugins

```
npx datocms plugins [--core] [--json]
```

- `--core` — also show core (built-in) plugins

## List official available plugins

```
npx datocms plugins:available [--json]
```

Lists official DatoCMS CLI plugins published by the DatoCMS team. Run this first to discover installable plugins before using `plugins:add`.

## Install a plugin

```
npx datocms plugins:add <PLUGIN> [-f] [-s | -v] [--json]
```

Alias: `plugins:install`

- `<PLUGIN>` — npm package name, GitHub URL, or GitHub slug (`user/repo`)
- `-f, --force` — force npm to fetch remote resources even if a local copy exists
- `-s, --silent` — silence npm output
- `-v, --verbose` — show verbose npm output

Example — install the WordPress importer:

```
npx datocms plugins:add @datocms/cli-plugin-wordpress
```

A user-installed plugin overrides a core plugin with the same command name.

## Inspect a plugin

```
npx datocms plugins:inspect <PLUGIN> [-v] [--json]
```

Displays installation properties (version, location, type) for a specific plugin.

## Link a plugin for local development

```
npx datocms plugins:link <PATH> [-v] [--[no-]install]
```

- `<PATH>` — path to the local plugin directory (defaults to `.`)
- `--[no-]install` — install dependencies after linking (default: install)

Used during plugin authoring to symlink a local directory into the CLI. A linked plugin overrides both user-installed and core plugins with the same command name.

## Remove a plugin

```
npx datocms plugins:remove <PLUGIN> [-v]
```

Aliases: `plugins:uninstall`, `plugins:unlink`

All three aliases behave identically — use whichever feels natural.

## Reset all plugins

```
npx datocms plugins:reset [--hard] [--reinstall]
```

- `--hard` — also delete `node_modules` and package manager files
- `--reinstall` — reinstall all plugins after removing them

**Destructive** — removes ALL user-installed and linked CLI plugins. Confirm with the user before proposing this command.

## Update installed plugins

```
npx datocms plugins:update [-v]
```

Updates all user-installed plugins to their latest versions.

## Guidance

- `plugins:add` and `plugins:install` are aliases — use either
- `plugins:remove`, `plugins:uninstall`, and `plugins:unlink` are all aliases — use any
- Always run `plugins:available` first to discover official DatoCMS CLI plugins before installing
- `plugins:reset` is destructive — always confirm before proposing
- These commands manage CLI-level extensions. DatoCMS project plugin development belongs in **datocms-plugin-builder**
