import type { AstroConfig, AstroIntegration } from 'astro';

try {
  process.loadEnvFile();
} catch {
  // No .env present in cwd. Rely on already-set process.env (CI, shell exports, etc).
}

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import rehypeExtractMeta, { type PageMeta } from '../../src/lib/rehype/rehype-extract-meta';
import rehypeExtractNoindex from '../../src/lib/rehype/rehype-extract-noindex';
import rehypeExtractMain from '../../src/lib/rehype/rehype-extract-main';
import { buildFrontmatter } from '../../src/lib/frontmatter';

interface AiSearchOptions {
  accountId?: string;
  apiToken?: string;
  instanceName?: string;
  kvNamespaceId?: string;
  /** Locale prefix to index. Single-locale for the prototype. */
  locale?: string;
  /**
   * Explicit allowlist of pathnames (no leading slash, trailing slash optional).
   * When set, only these paths are indexed. When undefined, all pages matching
   * the locale prefix are indexed. Use this to keep the prototype small.
   */
  paths?: string[];
  /** When true, delete items + KV entries no longer in the built pages list. Default: false (dry-run log). */
  pruneDeleted?: boolean;
}

type KvEntry = { hash: string; itemId?: string };

const CF_API = 'https://api.cloudflare.com/client/v4/accounts';

export default function aiSearch(options: AiSearchOptions = {}): AstroIntegration {
  const { locale = 'en', pruneDeleted = false, paths } = options;
  const pathAllowlist = paths ? new Set(paths.map((p) => p.replace(/^\/|\/$/g, ''))) : null;
  let site: string | undefined;

  return {
    name: 'ai-search',
    hooks: {
      'astro:config:done': ({ config }: { config: AstroConfig }) => {
        site = config.site;
      },
      'astro:build:done': async ({ pages, dir, logger }) => {
        const { accountId, apiToken, instanceName, kvNamespaceId } = options;
        if (!accountId || !apiToken || !instanceName || !kvNamespaceId) {
          const missing: string[] = [];
          if (!accountId) missing.push('CLOUDFLARE_ACCOUNT_ID');
          if (!apiToken) missing.push('CLOUDFLARE_API_TOKEN');
          if (!instanceName) missing.push('CLOUDFLARE_AI_SEARCH_INSTANCE_NAME');
          if (!kvNamespaceId) missing.push('CLOUDFLARE_AI_SEARCH_KV_NAMESPACE_ID');
          logger.warn(`Skipping AI Search indexing - missing env: ${missing.join(', ')}`);
          return;
        }
        if (!site) {
          logger.warn('Skipping AI Search indexing - astro `site` is not configured.');
          return;
        }

        const auth = { Authorization: `Bearer ${apiToken}` };
        const kvValueUrl = (key: string) =>
          `${CF_API}/${accountId}/storage/kv/namespaces/${kvNamespaceId}/values/${encodeURIComponent(key)}`;
        const itemsUrl = `${CF_API}/${accountId}/ai-search/instances/${instanceName}/items`;
        const itemUrl = (id: string) =>
          `${CF_API}/${accountId}/ai-search/instances/${instanceName}/items/${encodeURIComponent(id)}`;

        const localePrefix = `${locale}/`;
        const localePages = pages.filter((p) => p.pathname.startsWith(localePrefix));
        const targetPages = pathAllowlist
          ? localePages.filter((p) => pathAllowlist.has(p.pathname.replace(/\/$/, '')))
          : localePages;
        if (targetPages.length === 0) {
          logger.warn(
            pathAllowlist
              ? `No built pages matched the allowlist (${[...pathAllowlist].join(', ')}).`
              : `No pages found for locale "${locale}".`,
          );
          return;
        }
        if (pathAllowlist) {
          logger.info(`AI Search: indexing ${targetPages.length} allowlisted page(s).`);
        }

        const distDir = fileURLToPath(dir);
        const knownKeys = await listKvKeys({ accountId, kvNamespaceId, auth, logger });
        const currentKeys = new Set<string>();

        let added = 0;
        let updated = 0;
        let unchanged = 0;
        let skipped = 0;

        for (const page of targetPages) {
          const pathname = page.pathname;
          const htmlPath = join(distDir, pathname, 'index.html');

          let html: string;
          try {
            html = await readFile(htmlPath, 'utf8');
          } catch {
            logger.warn(`Skipping ${pathname}: ${htmlPath} not readable.`);
            skipped++;
            continue;
          }

          const result = await unified()
            .use(rehypeParse)
            .use(rehypeExtractMeta)
            .use(rehypeExtractNoindex)
            .use(rehypeExtractMain)
            .use(rehypeRemark)
            .use(remarkGfm)
            .use(remarkStringify)
            .process(html);

          if (result.data.noindex) {
            logger.info(`Skipping noindex page: ${pathname}`);
            skipped++;
            continue;
          }

          const meta = (result.data.meta ?? {}) as PageMeta;
          const url = `${site!.replace(/\/$/, '')}/${pathname}`;
          const languageName = safeLanguageName(locale);
          const frontmatter = buildFrontmatter({ meta, url, language: languageName });
          const markdown = frontmatter + String(result);

          const key = pathname.replace(/\/$/, '') || locale;
          currentKeys.add(key);
          const hash = sha256(markdown);

          const prev = await readKv({ url: kvValueUrl(key), auth });
          if (prev && prev.hash === hash) {
            unchanged++;
            continue;
          }

          const itemMetadata = {
            url,
            title: meta['og:title'] || meta['twitter:title'] || meta['dc.title'] || '',
            description:
              meta['og:description'] || meta['twitter:description'] || meta['dc.description'] || '',
            language: locale,
          };

          const filename = `${key}.md`;
          const itemId = await uploadItem({
            url: itemsUrl,
            auth,
            filename,
            markdown,
            metadata: itemMetadata,
            logger,
          });
          if (!itemId) {
            skipped++;
            continue;
          }

          await writeKv({ url: kvValueUrl(key), auth, value: { hash, itemId } });
          if (prev) {
            updated++;
            logger.info(`Updated: ${pathname} (item ${itemId})`);
          } else {
            added++;
            logger.info(`Added: ${pathname} (item ${itemId})`);
          }
        }

        const removed = [...knownKeys].filter((k) => !currentKeys.has(k));
        if (removed.length > 0) {
          if (pruneDeleted) {
            for (const key of removed) {
              const entry = await readKv({ url: kvValueUrl(key), auth });
              if (entry?.itemId) await deleteItem({ url: itemUrl(entry.itemId), auth, logger });
              await deleteKv({ url: kvValueUrl(key), auth });
              logger.info(`Pruned: ${key}`);
            }
          } else {
            logger.info(
              `Dry-run: ${removed.length} stale entries would be pruned (set pruneDeleted: true to delete): ${removed.join(', ')}`,
            );
          }
        }

        logger.info(
          `AI Search index: +${added} added, ~${updated} updated, =${unchanged} unchanged, !${skipped} skipped, -${removed.length} stale.`,
        );
      },
    },
  };
}

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

function safeLanguageName(code: string): string | undefined {
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(code);
  } catch {
    return undefined;
  }
}

async function listKvKeys({
  accountId,
  kvNamespaceId,
  auth,
  logger,
}: {
  accountId: string;
  kvNamespaceId: string;
  auth: Record<string, string>;
  logger: { warn: (m: string) => void };
}): Promise<Set<string>> {
  const keys = new Set<string>();
  let cursor: string | undefined;
  do {
    const url = `${CF_API}/${accountId}/storage/kv/namespaces/${kvNamespaceId}/keys${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`;
    const res = await fetch(url, { headers: auth });
    if (!res.ok) {
      logger.warn(`KV list failed (${res.status}). Continuing with empty known-keys set.`);
      return keys;
    }
    const body = (await res.json()) as {
      result: { name: string }[];
      result_info?: { cursor?: string };
    };
    body.result.forEach((k) => keys.add(k.name));
    cursor = body.result_info?.cursor || undefined;
  } while (cursor);
  return keys;
}

async function readKv({
  url,
  auth,
}: {
  url: string;
  auth: Record<string, string>;
}): Promise<KvEntry | null> {
  const res = await fetch(url, { headers: auth });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  try {
    return (await res.json()) as KvEntry;
  } catch {
    return null;
  }
}

async function writeKv({
  url,
  auth,
  value,
}: {
  url: string;
  auth: Record<string, string>;
  value: KvEntry;
}): Promise<void> {
  await fetch(url, {
    method: 'PUT',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  });
}

async function deleteKv({ url, auth }: { url: string; auth: Record<string, string> }): Promise<void> {
  await fetch(url, { method: 'DELETE', headers: auth });
}

async function uploadItem({
  url,
  auth,
  filename,
  markdown,
  metadata,
  logger,
}: {
  url: string;
  auth: Record<string, string>;
  filename: string;
  markdown: string;
  metadata: Record<string, string>;
  logger: { warn: (m: string) => void };
}): Promise<string | null> {
  const form = new FormData();
  form.append('file', new Blob([markdown], { type: 'text/markdown' }), filename);
  form.append('metadata', JSON.stringify(metadata));

  const res = await fetch(url, { method: 'POST', headers: auth, body: form });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    logger.warn(`Items upload failed for ${filename} (${res.status}): ${body.slice(0, 200)}`);
    return null;
  }
  try {
    const body = (await res.json()) as { result?: { id?: string }; id?: string };
    return body.result?.id ?? body.id ?? filename;
  } catch {
    return filename;
  }
}

async function deleteItem({
  url,
  auth,
  logger,
}: {
  url: string;
  auth: Record<string, string>;
  logger: { warn: (m: string) => void };
}): Promise<void> {
  const res = await fetch(url, { method: 'DELETE', headers: auth });
  if (!res.ok) {
    logger.warn(`Item delete failed (${res.status}) for ${url}`);
  }
}
