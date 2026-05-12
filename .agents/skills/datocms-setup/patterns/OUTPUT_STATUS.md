# Output Status Definitions

Use these labels consistently when reporting recipe results.

## `scaffolded`

The implementation is structurally complete but contains unresolved placeholders or project-specific values that the user must fill in. Examples:

- `YOUR_API_TOKEN` placeholder in env files
- `// TODO: add your model-to-route mappings` comments
- Generic search index IDs that need replacement

Always explicitly list every placeholder that remains.

## `production-ready`

The implementation is fully functional with no unresolved values. All tokens, routes, model mappings, and configuration are wired to real project values.

This status requires that:

- All environment variables reference real values or are populated
- All route mappings and model API keys match the actual DatoCMS project
- No placeholder comments remain in generated code
- The feature works end-to-end without manual edits

## Final handoff requirements

Every recipe handoff should:

- report whether the result is `scaffolded` or `production-ready`
- summarize the created, reused, or patched resources that matter for that recipe
- include a **Test it** section with one or more concrete verification steps the user can run immediately (see below)
- keep any recipe-specific follow-up recipe ids or operator next steps that the recipe requires

When unresolved values remain, always include an explicit `Unresolved placeholders` section and list every remaining placeholder or ownership ambiguity. If nothing remains, say `none`.

## Test it

Every recipe handoff must include a **Test it** section with the smallest concrete steps the user can take to verify the setup works. Tailor the steps to the recipe and framework. Prefer steps that exercise the real integration end-to-end over steps that only check file existence.

Examples by recipe category:

### Frontend foundation recipes (draft-mode, web-previews, content-link, realtime, cache-tags)

- Provide the exact URL the user can open to test the endpoint, e.g.: `http://localhost:3000/api/draft-mode/enable?token=<SECRET_API_TOKEN>&url=/`
- State what they should see (redirect to `/` with draft content, cookie set, overlay visible, etc.)
- For disable: `http://localhost:3000/api/draft-mode/disable?url=/`
- For cache-tags: "Publish a record in DatoCMS and confirm the page updates within N seconds"
- For content-link: "Open the preview, hover over a text block, and confirm the pencil icon appears"
- For realtime: "Edit a field in DatoCMS and confirm the preview updates without a page reload"

### Frontend feature recipes (responsive-images, structured-text, seo, etc.)

- Point to a specific page or component where the feature should be visible
- State what they should see: "The image should render with srcset and a blur-up placeholder"

### Migration recipes

- Provide the exact CLI command to run: `npm run datocms:migrations:dry-run`
- State what a successful dry run looks like

### Platform recipes (webhooks, build-triggers)

- Provide a curl command or DatoCMS dashboard step to trigger the webhook
- State what the expected response or side-effect is

### General rules

- Always assume the dev server is already running — never tell the user to start it
- Use the actual env var names and route paths from the generated code, not generic placeholders
- If the recipe is `scaffolded` (tokens still placeholder), note which values must be filled in before testing
- Keep it to 1-3 steps — this is a quick smoke test, not a full QA checklist
