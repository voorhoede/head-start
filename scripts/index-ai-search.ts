import { createHash } from 'node:crypto';
import { parseFrontmatter } from '../src/lib/frontmatter.ts';

try {
  process.loadEnvFile();
} catch {
  // No .env in cwd. Rely on already-set process.env (CI, shell exports).
}

const {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_AI_SEARCH_INSTANCE_NAME,
  CLOUDFLARE_AI_SEARCH_KV_NAMESPACE_ID,
  SITE_URL,
  AI_SEARCH_PRUNE_STALE,
} = process.env;

const missing: string[] = [];
if (!CLOUDFLARE_ACCOUNT_ID) missing.push('CLOUDFLARE_ACCOUNT_ID');
if (!CLOUDFLARE_API_TOKEN) missing.push('CLOUDFLARE_API_TOKEN');
if (!CLOUDFLARE_AI_SEARCH_INSTANCE_NAME) missing.push('CLOUDFLARE_AI_SEARCH_INSTANCE_NAME');
if (!SITE_URL) missing.push('SITE_URL');
if (missing.length > 0) {
  console.error(`Missing required env: ${missing.join(', ')}`);
  process.exit(1);
}

const siteUrl = SITE_URL!.replace(/\/$/, '');
const cfBase = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}`;
const itemsUrl = `${cfBase}/ai-search/instances/${CLOUDFLARE_AI_SEARCH_INSTANCE_NAME}/items`;
const itemUrl = (id: string) =>
  `${cfBase}/ai-search/instances/${CLOUDFLARE_AI_SEARCH_INSTANCE_NAME}/items/${encodeURIComponent(id)}`;
const kvValueUrl = (key: string) =>
  `${cfBase}/storage/kv/namespaces/${CLOUDFLARE_AI_SEARCH_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
const kvKeysUrl = (cursor?: string) =>
  `${cfBase}/storage/kv/namespaces/${CLOUDFLARE_AI_SEARCH_KV_NAMESPACE_ID}/keys${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`;
const auth = { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` };

const cacheEnabled = Boolean(CLOUDFLARE_AI_SEARCH_KV_NAMESPACE_ID);
const pruneEnabled = AI_SEARCH_PRUNE_STALE === '1' || AI_SEARCH_PRUNE_STALE === 'true';

type CacheEntry = { hash: string; itemId: string };

const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

const fetchText = async (url: string): Promise<Response> => {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) fail(`Fetch failed (${res.status}) for ${url}`);
  return res;
};

const extractLocs = (xml: string): string[] =>
  [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, '\''),
  );

const collectSitemapUrls = async (): Promise<string[]> => {
  const indexXml = await (await fetchText(`${siteUrl}/sitemap-index.xml`)).text();
  const sitemapUrls = extractLocs(indexXml);
  const urls = new Set<string>();
  for (const sm of sitemapUrls) {
    const xml = await (await fetchText(sm)).text();
    extractLocs(xml).forEach((u) => urls.add(u));
  }
  return [...urls];
};

const mdUrlFor = (pageUrl: string): { url: string; key: string } => {
  const u = new URL(pageUrl);
  const path = u.pathname.replace(/^\/|\/$/g, '');
  u.pathname = path ? `/api/content/${path}.md` : '/api/content.md';
  return { url: u.toString(), key: path || 'index' };
};

const sha256 = (input: string): string =>
  createHash('sha256').update(input).digest('hex');

const uploadItem = async (
  key: string,
  markdown: string,
  metadata: Record<string, string>,
): Promise<string | null> => {
  const form = new FormData();
  form.append('file', new Blob([markdown], { type: 'text/markdown' }), `${key}.md`);
  form.append('metadata', JSON.stringify(metadata));
  const res = await fetch(itemsUrl, { method: 'POST', headers: auth, body: form });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.warn(`Items upload failed for ${key} (${res.status}): ${body.slice(0, 200)}`);
    return null;
  }
  try {
    const body = (await res.json()) as { result?: { id?: string }; id?: string };
    return body.result?.id ?? body.id ?? null;
  } catch {
    return null;
  }
};

const deleteItem = async (id: string): Promise<void> => {
  const res = await fetch(itemUrl(id), { method: 'DELETE', headers: auth });
  if (!res.ok && res.status !== 404) {
    console.warn(`Item delete failed (${res.status}) for ${id}`);
  }
};

const kvGet = async (key: string): Promise<CacheEntry | null> => {
  const res = await fetch(kvValueUrl(key), { headers: auth });
  if (res.status === 404) return null;
  if (!res.ok) {
    console.warn(`KV get failed (${res.status}) for ${key}. Treating as miss.`);
    return null;
  }
  try {
    return (await res.json()) as CacheEntry;
  } catch {
    return null;
  }
};

const kvPut = async (key: string, value: CacheEntry): Promise<void> => {
  const res = await fetch(kvValueUrl(key), {
    method: 'PUT',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  });
  if (!res.ok) console.warn(`KV put failed (${res.status}) for ${key}`);
};

const kvDelete = async (key: string): Promise<void> => {
  const res = await fetch(kvValueUrl(key), { method: 'DELETE', headers: auth });
  if (!res.ok && res.status !== 404) console.warn(`KV delete failed (${res.status}) for ${key}`);
};

const kvListKeys = async (): Promise<Set<string>> => {
  const keys = new Set<string>();
  let cursor: string | undefined;
  do {
    const res = await fetch(kvKeysUrl(cursor), { headers: auth });
    if (!res.ok) {
      console.warn(`KV list failed (${res.status}). Skipping prune phase.`);
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
};

async function indexAiSearch(): Promise<void> {
  const pageUrls = await collectSitemapUrls();
  console.log(`Found ${pageUrls.length} URL(s) in ${siteUrl}/sitemap-index.xml`);
  console.log(cacheEnabled ? 'Cache: enabled (KV hash-skip)' : 'Cache: disabled (re-uploading every page)');

  const knownKeys = cacheEnabled ? await kvListKeys() : new Set<string>();
  const currentKeys = new Set<string>();

  let added = 0;
  let updated = 0;
  let unchanged = 0;
  let skipped = 0;

  for (const pageUrl of pageUrls) {
    const { url: md, key } = mdUrlFor(pageUrl);
    const res = await fetch(md, { headers: { Accept: 'text/markdown' }, redirect: 'follow' });

    if (res.status === 404) {
      console.log(`skip 404: ${pageUrl}`);
      skipped++;
      continue;
    }
    if (!res.ok) fail(`Markdown fetch failed (${res.status}) for ${md}`);

    if (res.headers.get('X-Robots-Tag')?.includes('noindex')) {
      console.log(`skip noindex: ${pageUrl}`);
      skipped++;
      continue;
    }

    const markdown = await res.text();
    currentKeys.add(key);
    const hash = sha256(markdown);
    const prev = cacheEnabled ? await kvGet(key) : null;

    if (prev && prev.hash === hash) {
      console.log(`unchanged: ${pageUrl}`);
      unchanged++;
      continue;
    }

    if (prev?.itemId) {
      await deleteItem(prev.itemId);
    }

    const fm = parseFrontmatter(markdown);
    const itemId = await uploadItem(key, markdown, {
      url: fm.url || pageUrl,
      title: fm.title || '',
      description: fm.description || '',
      language: fm.language || '',
    });
    if (!itemId) {
      skipped++;
      continue;
    }

    if (cacheEnabled) {
      await kvPut(key, { hash, itemId });
    }

    if (prev) {
      console.log(`updated: ${pageUrl} (item ${itemId})`);
      updated++;
    } else {
      console.log(`added: ${pageUrl} (item ${itemId})`);
      added++;
    }
  }

  let pruned = 0;
  if (cacheEnabled) {
    const stale = [...knownKeys].filter((k) => !currentKeys.has(k));
    if (stale.length > 0) {
      if (pruneEnabled) {
        for (const key of stale) {
          const entry = await kvGet(key);
          if (entry?.itemId) await deleteItem(entry.itemId);
          await kvDelete(key);
          console.log(`pruned: ${key}`);
          pruned++;
        }
      } else {
        console.log(
          `dry-run: ${stale.length} stale entrie(s) would be pruned (set AI_SEARCH_PRUNE_STALE=1 to delete): ${stale.join(', ')}`,
        );
      }
    }
  }

  console.log(
    `Done. +${added} added, ~${updated} updated, =${unchanged} unchanged, !${skipped} skipped, -${pruned} pruned.`,
  );
}

indexAiSearch().catch((error) => {
  console.error('AI Search indexing failed:', error);
  process.exit(1);
});
