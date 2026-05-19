import { readFileSync } from 'node:fs';

try {
  process.loadEnvFile();
} catch {
  // No .env in cwd. Rely on already-set process.env (CI, shell exports).
}

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { name: string };

const {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_AI_SEARCH_INSTANCE_NAME,
  SITE_URL,
} = process.env;

const missing: string[] = [];
if (!CLOUDFLARE_ACCOUNT_ID) missing.push('CLOUDFLARE_ACCOUNT_ID');
if (!CLOUDFLARE_API_TOKEN) missing.push('CLOUDFLARE_API_TOKEN');
if (!CLOUDFLARE_AI_SEARCH_INSTANCE_NAME) missing.push('CLOUDFLARE_AI_SEARCH_INSTANCE_NAME');
if (missing.length > 0) {
  console.error(`Missing required env: ${missing.join(', ')}`);
  process.exit(1);
}

const siteUrl = (SITE_URL || `https://${pkg.name}.pages.dev`).replace(/\/$/, '');
const itemsUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai-search/instances/${CLOUDFLARE_AI_SEARCH_INSTANCE_NAME}/items`;
const auth = { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` };

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

// First YAML frontmatter block as written by buildFrontmatter: `key: "value"` per line, quoted values.
const extractFrontmatter = (md: string): Record<string, string> => {
  const match = md.match(/^---\n([\s\S]+?)\n---\n/);
  if (!match) return {};
  const result: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const sep = line.indexOf(': ');
    if (sep < 0) continue;
    const key = line.slice(0, sep);
    let val = line.slice(sep + 2);
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val
        .slice(1, -1)
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    }
    result[key] = val;
  }
  return result;
};

const uploadItem = async (
  key: string,
  markdown: string,
  metadata: Record<string, string>,
): Promise<void> => {
  const form = new FormData();
  form.append('file', new Blob([markdown], { type: 'text/markdown' }), `${key}.md`);
  form.append('metadata', JSON.stringify(metadata));
  const res = await fetch(itemsUrl, { method: 'POST', headers: auth, body: form });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    fail(`Items upload failed for ${key} (${res.status}): ${body.slice(0, 300)}`);
  }
};

const pageUrls = await collectSitemapUrls();
console.log(`Found ${pageUrls.length} URL(s) in ${siteUrl}/sitemap-index.xml`);

let indexed = 0;
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
  const fm = extractFrontmatter(markdown);
  await uploadItem(key, markdown, {
    url: fm.url || pageUrl,
    title: fm.title || '',
    description: fm.description || '',
    language: fm.language || '',
  });
  console.log(`indexed: ${pageUrl}`);
  indexed++;
}

console.log(`Done. ${indexed} indexed, ${skipped} skipped.`);
