# AI Chat (multi-turn)

**Add multi-turn chat as a sibling to the existing single-question AI Search, sharing the same Cloudflare AI Search instance but exposed at a separate endpoint and page.**

- Date: 2026-05-27
- Alternatives Considered: extend `/api/ai-search` to accept either `{ query }` or `{ messages }`; replace single-question search entirely with chat; configurable DatoCMS block fields (intro text, placeholder); persist chat conversation server-side (Workers KV); skip persistence entirely
- Decision Made By: [Ani](https://github.com/anareyna)

## Decision

The [AI Search prototype](./2026-05-20-ai-search-prototype.md) shipped a single-question search surface. Multi-turn chat is the natural next step on the same retrieval backend. Cloudflare AI Search's `chat/completions` endpoint already accepts an OpenAI-style `messages` array, so the upstream call is the same shape we use today; only the client contract changes.

Chat ships as a **second endpoint** (`/api/ai-chat`) rather than extending `/api/ai-search`. Two reasons. First, the request shapes are different enough (`{ query }` vs `{ messages: [...] }`) that overloading the same route would mean either a discriminator field or content-type sniffing, both of which trade clarity for one fewer file. Second, it keeps the search proxy contract stable while chat iterates, so the existing search component does not need to re-handle either shape.

Search and chat both stay live for now. The product call between "search is the surface" and "chat is the surface" is something we can only make once people use them; killing search before that signal exists would throw away working UX on a hunch. We can remove one later without breaking the other.

History is capped to the **last 10 messages**, server-side, in the proxy. The cap protects token cost on Cloudflare's side and bounds the request size regardless of what the client sends. Clients should still trim locally for their own reasons (localStorage size, render perf), but the proxy is the source of truth. The cap is silent: if the client sends 30 messages, the proxy keeps the most recent 10 and, if the trim leaves an `assistant` message at the start, drops one more so the conversation begins with `user` (which Cloudflare requires). Raising the cap is a one-line change if we hit the ceiling.

The chat UI lands in a follow-up PR as three things: an `<ai-chat>` web component, a DatoCMS block that drops the component into any page, and a dedicated `/[locale]/chat/` route. The block ships with **no configurable fields** in this first cut. Editors who want to tweak intro copy or placeholder text can fork the component; we will add fields when there is a concrete editorial ask, not preemptively.

Conversation state persists in `localStorage`, scoped per locale (`ai-chat:en`, `ai-chat:nl`, …), with a "Clear chat" button. Server-side persistence (KV per session, account) was rejected as overkill for a prototype: it would need session IDs, a TTL story, and a privacy stance, none of which we are ready to commit to. Browser-only state means a refresh keeps the chat (avoiding the "I lost my answer" frustration of fresh-on-every-load), but switching browsers or clearing storage wipes it. Per-locale scoping prevents an `nl` chat from leaking into the `en` view if the user switches language mid-conversation.

The chat client reuses the streaming and markdown-rendering code already in `<ai-search>` by extracting `src/lib/ai-stream.ts` from `AiSearch.client.ts` in the follow-up PR. No new dependency, just shared internals once there are two callers.
