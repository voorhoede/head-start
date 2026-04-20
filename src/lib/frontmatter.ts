import type { PageMeta } from '~/lib/rehype/rehype-extract-meta';

export interface Alternate {
  locale: string;
  url: string;
}

export interface FrontmatterOptions {
  meta: PageMeta;
  url: string;
  alternates?: Alternate[];
}

function yamlQuote(value: string): string {
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
  return `"${escaped}"`;
}

function addField(lines: string[], key: string, value: string | undefined) {
  if (value) {
    const safeKey = key.includes(':') ? yamlQuote(key) : key;
    lines.push(`${safeKey}: ${yamlQuote(value)}`);
  }
}

export function buildFrontmatter({ meta, url, alternates = [] }: FrontmatterOptions): string {
  const lines: string[] = [];

  // Core
  addField(lines, 'title', meta['og:title'] || meta['twitter:title'] || meta['dc.title']);
  addField(lines, 'description', meta['og:description'] || meta['twitter:description'] || meta['dc.description']);
  addField(lines, 'url', meta['og:url'] || url);

  // Open Graph
  addField(lines, 'og:title', meta['og:title']);
  addField(lines, 'og:description', meta['og:description']);
  addField(lines, 'og:image', meta['og:image']);
  addField(lines, 'og:image:width', meta['og:image:width']);
  addField(lines, 'og:image:height', meta['og:image:height']);
  addField(lines, 'og:image:alt', meta['og:image:alt']);
  addField(lines, 'og:type', meta['og:type']);
  addField(lines, 'og:site_name', meta['og:site_name']);
  addField(lines, 'og:locale', meta['og:locale']);

  // Twitter Card
  addField(lines, 'twitter:card', meta['twitter:card']);
  addField(lines, 'twitter:site', meta['twitter:site']);
  addField(lines, 'twitter:title', meta['twitter:title']);
  addField(lines, 'twitter:description', meta['twitter:description']);
  addField(lines, 'twitter:image', meta['twitter:image']);

  // Article
  addField(lines, 'article:modified_time', meta['article:modified_time']);
  addField(lines, 'article:published_time', meta['article:published_time']);
  addField(lines, 'article:publisher', meta['article:publisher']);
  addField(lines, 'article:author', meta['article:author']);

  // Alternates
  if (alternates.length > 0) {
    lines.push('alternates:');
    for (const alt of alternates) {
      lines.push(`  - locale: ${yamlQuote(alt.locale)}`);
      lines.push(`    url: ${yamlQuote(alt.url)}`);
    }
  }

  if (lines.length === 0) return '';
  return `---\n${lines.join('\n')}\n---\n\n`;
}
