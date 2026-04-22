import type { PageMeta } from '~/lib/rehype/rehype-extract-meta';

export interface FrontmatterOptions {
  meta: PageMeta;
  url: string;
  language?: string;
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
    lines.push(`${key}: ${yamlQuote(value)}`);
  }
}

export function buildFrontmatter({ meta, url, language }: FrontmatterOptions): string {
  const lines: string[] = [];

  addField(lines, 'title', meta['og:title'] || meta['twitter:title'] || meta['dc.title']);
  addField(lines, 'description', meta['og:description'] || meta['twitter:description'] || meta['dc.description']);
  addField(lines, 'language', language);
  addField(lines, 'url', meta['og:url'] || url);

  if (lines.length === 0) return '';
  return `---\n${lines.join('\n')}\n---\n\n`;
}
