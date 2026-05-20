# AI Search prototype

**Use Cloudflare AI Search for the first natural-language search prototype, with post-deploy indexing driven by the existing `/api/content/*.md` endpoint and a KV-backed hash cache.**

- Date: 2026-05-20
- Alternatives Considered: build-time indexing inside an Astro integration; Vercel AI SDK + Cloudflare Workers AI + Vectorize as a custom RAG stack; no cache (re-upload every page on every deploy); allowlisted page subset
- Decision Made By: [Jasper](https://github.com/jbmoelker), [Ani](https://github.com/anareyna)

## Decision

The AI search and chat roadmap calls for visitors to interact with Head Start sites in natural language. For the first prototype we picked [Cloudflare AI Search](https://developers.cloudflare.com/ai-search/) over a custom RAG stack built on Vercel AI SDK + Workers AI + Vectorize. AI Search ships the full pipeline (chunking, embeddings, vector index, retrieval, LLM call, OpenAI-compatible API) behind one managed service, keeps us on the same vendor as the existing deploy target, and lets us validate the user-facing experience before committing to a heavier abstraction. The Vercel AI SDK remains a reasonable abstraction layer to introduce later, alongside the web component that actually consumes the API.

Indexing runs **post-deploy**, not at build time. The indexer fetches each page's published markdown from the existing [`/api/content/<path>.md`](../../src/pages/api/content/%5B...path%5D.md.ts) endpoint, so the same code path that decides "is this page indexable" (the `allowAiBots` toggle, per-page `noIndex`, preview-mode gating) governs both what humans-with-bots can read and what gets indexed. Build-time indexing was ruled out because the markdown endpoint is `prerender = false` and the deployed URLs only exist after a release lands. The trigger is a [GitHub Action](../../.github/workflows/index-ai-search.yml) listening for Cloudflare Pages' `deployment_status: success` on the production environment, mirroring how DatoCMS Site Search is wired up.

The indexer caches a content fingerprint per page in [Workers KV](https://developers.cloudflare.com/kv/) so that re-deploys only cost embeddings on pages whose markdown actually changed. The cache is optional: leaving `CLOUDFLARE_AI_SEARCH_KV_NAMESPACE_ID` empty falls back to "re-upload every page on every run", which is correct but wasteful. The Items API exposes no PUT, so content updates run as DELETE-old + POST-new using the item ID we stored in KV alongside the hash; this avoids leaking orphaned items in the search index. An end-of-run sweep flags KV entries whose URLs are no longer in the sitemap, but actual deletion is gated behind an opt-in `AI_SEARCH_PRUNE_STALE=1` flag so a misconfigured sitemap can't silently wipe the index.

Scope for this first cut is the indexer plus a thin [streaming query proxy](../../src/pages/api/ai-search.ts) at `/api/ai-search` that hides the Cloudflare API token from the client. No UI yet: the `<ai-search>` web component lands as a separate PR so the search and chat surfaces can be designed once on top of the same backend. Setup for new Head Start projects is documented in [Getting Started](../getting-started.md#enable-ai-search).
