# Mandatory Rules

These rules apply to every datocms-setup recipe. They are not repeated in individual recipe files.

## Contents

- TypeScript Strictness
- File Conflict Handling
- Shared Repo Inspection Defaults
- Framework Environment Variable Conventions
- Dependency Installation
- Zero Questions Default
- Question Format
- Project Link or Create
- CLI over MCP

## TypeScript Strictness

- **Never** use `as unknown as SomeType` — this is a forbidden anti-pattern
- Avoid `as SomeType` casts — use type guards or fix upstream types instead
- Prefer `import type { ... }` for type-only imports
- Let TypeScript infer types wherever possible — do not add redundant annotations

## File Conflict Handling

- Always read existing files before writing — never blindly overwrite
- Make targeted additions to existing files instead of full replacements
- Preserve existing imports, exports, and surrounding code
- If an existing setup is materially different, patch in place by default
- Only ask about full replacement when the current setup is clearly incompatible or the user explicitly asked for a rewrite

## Shared Repo Inspection Defaults

- Start from `../references/repo-conventions.md` before following recipe-specific checks
- Confirm the strongest framework, runtime, `src/` layout, package-manager, and env-file signals first
- Inspect existing route helpers, query wrappers, renderer components, scripts, and endpoints before creating new ones
- Preserve the strongest existing owner by default instead of creating a parallel implementation
- Ask only when patching the wrong owner would materially change behavior, safety, or project conventions

## Framework Environment Variable Conventions

| Framework | Public prefix | Server-only | File |
| - | - | - | - |
| Next.js | `NEXT_PUBLIC_` | no prefix | `.env.local` |
| Nuxt | `NUXT_PUBLIC_` (runtime) | `NUXT_` (runtime) | `.env` |
| SvelteKit | `PUBLIC_` | no prefix | `.env` |
| Astro | `PUBLIC_` | no prefix | `.env` |

- Add variables to `.env.example` (with placeholder values) and the actual env file
- Never commit real tokens — use placeholder values in examples

## Dependency Installation

Detect the project's package manager before installing:

1. `pnpm-lock.yaml` -> `pnpm add`
2. `yarn.lock` -> `yarn add`
3. `bun.lockb` -> `bun add`
4. Otherwise -> `npm install`

Always install DatoCMS packages as regular dependencies (not devDependencies) unless the package is CLI-only.

## Zero Questions Default

Ask zero questions by default for straightforward frontend rendering or foundation setup when the repo already answers the important decisions. Proceed with sensible defaults and call out assumptions.

For operational recipes — especially migrations, imports into existing targets, and platform automation that can affect production workflows — ask the minimum clarification set needed when the repo cannot safely answer the critical questions.

Only ask when a safe implementation is blocked by something the repo cannot answer, such as:

- Missing model-to-route mappings required for correctness
- Ambiguous existing setup where patching the wrong file would break things
- Missing external service credentials that have no reasonable default
- Operational choices the repo cannot infer safely, such as release profiles, destructive importer tolerance, or whether to preserve an existing CLI convention

## Question Format

- Infer first from the repo, then ask only the smallest high-impact follow-up
- Default to one concise question unless the recipe explicitly calls for one grouped pass
- Put the recommended/default path first
- Explain what happens if the user skips the question
- If the user skips, preserve the strongest existing owner or the documented default and record unresolved assumptions under `Unresolved placeholders`

### Structured questions (Claude Code)

When the `AskUserQuestion` tool is available, use it instead of inline prose for every user-facing question. Map each decision point to a separate question with discrete options:

- Use a short `header` (max 12 chars) that names the decision, e.g. `"Edit mode"`, `"Realtime"`, `"Index shape"`
- List 2-4 concrete options with a `label` and a one-sentence `description`
- Put the recommended option first and append `(Recommended)` to its label
- Use `multiSelect: true` only when choices are not mutually exclusive
- Group related decisions into a single `AskUserQuestion` call (up to 4 questions per call) rather than asking them one at a time
- If the recipe specifies a "skip" default, include it in the description of the recommended option so the user knows what happens if they just accept the default

Example — visual-editing grouped follow-up:

```
questions: [
  {
    question: "Which editing modes should I set up?",
    header: "Edit mode",
    options: [
      { label: "Both (Recommended)", description: "Website click-to-edit overlays + side-by-side editing inside DatoCMS" },
      { label: "Website click-to-edit only", description: "Content Link overlays on your live site, no side-by-side panel" },
      { label: "Side-by-side only", description: "Preview panel inside DatoCMS editor, no website overlays" }
    ],
    multiSelect: false
  },
  {
    question: "Enable real-time updates while editors type?",
    header: "Realtime",
    options: [
      { label: "No (Recommended)", description: "Editors reload the preview manually. Simpler setup, fewer moving parts." },
      { label: "Yes", description: "Preview updates live as editors type. Requires an SSE subscription per page." }
    ],
    multiSelect: false
  }
]
```

### Fallback (Codex / non-interactive)

When `AskUserQuestion` is not available, present the same choices as a numbered list in plain text. Keep the same structure: label the recommended default, describe what each option does, and state what happens on skip.

## Project Link or Create

Triggered by SKILL.md greenfield gate (no `package.json` and no `datocms.config.json`). Ask one structured question with `header: "Project"` before any recipe selection:

> "Do you already have a DatoCMS project, or should we create a new one?"

1. **Link existing project** — bootstrap the Node project per the requested lane, then route to `cli-bootstrap`.
2. **Create new project** — direct user to `https://dashboard.datocms.com/` (canonical; never `dato.com` or marketing/invented domains). Wait for explicit confirmation the project exists, then queue `datocms-content-modeling` for model design _before_ any frontend recipe (models must exist before queries). After modeling → `cli-bootstrap`.

Neither option is universally recommended — agent can't infer which applies. Do **not** append `(Recommended)` or set a default-on-skip — overrides the general "put recommended first" rule above. Order: "Link existing" first (more common), "Create new" second.

## CLI over MCP

DatoCMS CLI is the only sanctioned tool for project discovery, linking, schema inspection, CMA scripting, migrations. Never invoke any DatoCMS MCP tool even when present in the toolset.

Why: CLI uses OAuth via `datocms login` and reads/writes `datocms.config.json` — repo stays source of truth. MCP bypasses this and produces config drift.

Load `datocms-cli` sibling skill for the equivalent CLI command. Only `npx datocms login` is user-driven (interactive browser) — no MCP shortcut.
