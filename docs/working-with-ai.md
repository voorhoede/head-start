# Working with AI

Head Start ships with first-class support for AI coding agents. This covers the three pieces that make it work: **agent instructions** (`AGENTS.md`), **domain skills** (`.agents/skills/`), and **MCP servers** (`.mcp.json`).

## Agent instructions

[`AGENTS.md`](../AGENTS.md) at the repo root is the primary entry point for any AI coding agent. It contains:

- Project overview and philosophy
- Required reading (key docs to load before making changes)
- Available skills and when to use them
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

Project skills are vendored into `.agents/skills/`, one directory per skill:

```
.agents/skills/
├── astro/
├── cloudflare/
├── datocms/
├── frontend-design/
├── web-perf/
└── wrangler/
```

Each skill directory contains a `SKILL.md` with focused guidance the agent loads on demand. The skills are listed in `AGENTS.md` alongside their trigger conditions so the agent knows when to load each one.

### Where skills come from

Skill sources are pinned in [`skills-lock.json`](../skills-lock.json). Each entry records the GitHub repository the skill was pulled from and a hash to detect upstream changes:

| Skill | Source |
| --- | --- |
| `astro` | `astrolicious/agent-skills` |
| `datocms` | `jodusnodus/datocms-skill` |
| `frontend-design` | `anthropics/skills` |
| `cloudflare` | `cloudflare/skills` |
| `wrangler` | `cloudflare/skills` |
| `web-perf` | `cloudflare/skills` |

### Updating skills

Use `npx skills` to add or refresh skills from their upstream source:

```bash
# Re-install all skills from their locked sources
npx skills add astrolicious/agent-skills
npx skills add cloudflare/skills
npx skills add jodusnodus/datocms-skill
npx skills add anthropics/skills
```

After running this, review any changes to the skill files in `.agents/skills/` before committing — treat upstream skill updates the same way you would a dependency update.

### Adding a new skill

Browse available skills at [skills.sh](https://skills.sh/), then:

```bash
npx skills add <owner/repo>
```

This downloads the skill into `.agents/skills/` and updates `skills-lock.json`. Then register the skill in `AGENTS.md` under the **Agent skills** table so the agent knows when to load it.

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
