# Working with AI

Head Start ships with first-class support for AI coding agents. This covers the three pieces that make it work: **agent instructions** (`AGENTS.md`), **domain skills** (`.agents/skills/`), and **MCP servers** (`.mcp.json`).

## Agent instructions

[`AGENTS.md`](../AGENTS.md) at the repo root is the primary entry point for any AI coding agent. It contains:

- Project overview and philosophy
- Required reading (key docs to load before making changes)
- A pointer to project skills (`.agents/skills/`)
- MCP servers that are pre-configured
- Environment setup, build/run/test commands
- Code style guidelines and GraphQL/CMS workflow
- Security considerations and guardrails (destructive actions, loop prevention)
- Commit and PR guidelines
- Known rough edges and nuances

Most MCP-compatible agents (Claude Code, Cursor, GitHub Copilot, etc.) pick this file up automatically when you open the repository.

## Agent skills

Skills are reusable capability bundles that give agents focused, project-validated guidance for a specific domain. They are part of the [open agent skills ecosystem](https://skills.sh/) and are managed via the [`skills` CLI](https://skills.sh/docs/cli).

### Where they live

Project skills are vendored into [`.agents/skills/`](../.agents/skills/), one directory per skill. Each contains a `SKILL.md` whose frontmatter `description` declares its trigger — agents discover and load them on demand.

Sources are pinned in [`skills-lock.json`](../skills-lock.json). It is auto-managed by the `skills` CLI — don't edit it by hand.

### Adding or updating a skill

Browse available skills at [skills.sh](https://skills.sh/), then:

```bash
npx skills add <owner/repo>
```

This vendors the skill into `.agents/skills/` and updates `skills-lock.json`. No further documentation is needed — the `SKILL.md` is the source of truth for when to load it.

To refresh installed skills, re-run `npx skills add` against their source. Review the diff in `.agents/skills/` before committing — treat upstream skill updates the same as a dependency bump.

To remove a skill, run `npx skills remove <name>` and verify `skills-lock.json` is updated.

## MCP servers

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/) servers give agents live access to external tools and data sources beyond their training knowledge. The project pre-configures four servers in [`.mcp.json`](../.mcp.json), which is picked up automatically by Claude Code, Cursor, and other compatible agents.

| Server | Purpose |
| --- | --- |
| `datocms` | Query and manage the CMS schema, records, environments, and assets directly. Requires `DATOCMS_API_TOKEN` in your shell environment. |
| `astro-docs` | Live Astro documentation — prevents hallucinating outdated APIs. |
| `cloudflare-docs` | Live Cloudflare documentation — covers Pages, Workers, and `wrangler` config. |
| `chrome-devtools` | Drive a real browser for visual QA: navigate pages, inspect the DOM, take screenshots, check console errors. Run `npm run dev` first and point the agent at `http://localhost:4323`. |

The `stdio`-based servers (`datocms`, `chrome-devtools`) are launched on demand via `npx` — no global install needed. The HTTP-based servers (`astro-docs`, `cloudflare-docs`) connect to remote endpoints directly.

> **Security:** `DATOCMS_API_TOKEN` is read from your shell environment. Never hardcode tokens in `.mcp.json` — it is committed to the repository.
