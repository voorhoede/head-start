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
    .replace(/\r/g, '\\r')
    .split('')
    .filter(ch => {
      const c = ch.charCodeAt(0);
      return c > 8 && c !== 11 && c !== 12 && (c < 14 || c > 31) && c !== 127;
    })
    .join('');
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

const unescapeMap: Record<string, string> = {
  n: '\n',
  r: '\r',
  '"': '"',
  '\\': '\\',
};

function yamlUnquote(value: string): string {
  if (value.length < 2 || !value.startsWith('"') || !value.endsWith('"')) {
    return value;
  }
  // One regex pass, not chained .replace() calls. Chaining would re-scan text it
  // already unescaped, so a literal "\n" in the source could wrongly become a
  // real newline. Scanning the raw string once handles each escape exactly once.
  return value.slice(1, -1).replace(/\\(.)/g, (_, char) => unescapeMap[char] ?? char);
}

/**
 * Parse a front matter block produced by `buildFrontmatter` back into a flat
 * key/value map. Inverse of `buildFrontmatter`: reads `key: "value"` lines and
 * unquotes values with the same escape rules as `yamlQuote`.
 * Returns an empty object when the input has no leading `---` block.
 */
export function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]+?)\n---\n/);
  if (!match) return {};
  const result: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(': ');
    if (separator < 0) continue;
    result[line.slice(0, separator)] = yamlUnquote(line.slice(separator + 2));
  }
  return result;
}
