import ogs from 'open-graph-scraper';
import type { ImageObject, TwitterImageObject } from 'open-graph-scraper/types';

export interface Alternate {
  locale: string;
  url: string;
}

export interface FrontmatterOptions {
  html: string;
  url: string;
  alternates?: Alternate[];
}

function yamlQuote(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function addField(lines: string[], key: string, value: string | undefined) {
  if (value) {
    const safeKey = key.includes(':') ? yamlQuote(key) : key;
    lines.push(`${safeKey}: ${yamlQuote(value)}`);
  }
}

function addImageFields(lines: string[], prefix: string, image: ImageObject | TwitterImageObject | undefined) {
  if (!image) return;
  addField(lines, prefix, image.url);
  if (image.width) addField(lines, `${prefix}:width`, String(image.width));
  if (image.height) addField(lines, `${prefix}:height`, String(image.height));
  if (image.alt) addField(lines, `${prefix}:alt`, image.alt);
}

export async function extractFrontmatter({ html, url, alternates = [] }: FrontmatterOptions): Promise<string> {
  const { result } = await ogs({ html });
  const lines: string[] = [];

  // Core
  addField(lines, 'title', result.ogTitle || result.twitterTitle || result.dcTitle);
  addField(lines, 'description', result.ogDescription || result.twitterDescription || result.dcDescription);
  addField(lines, 'url', result.ogUrl || url);

  // Open Graph
  addField(lines, 'og:title', result.ogTitle);
  addField(lines, 'og:description', result.ogDescription);
  addImageFields(lines, 'og:image', result.ogImage?.[0]);
  addField(lines, 'og:type', result.ogType);
  addField(lines, 'og:site_name', result.ogSiteName);
  addField(lines, 'og:locale', result.ogLocale);

  // Twitter Card
  addField(lines, 'twitter:card', result.twitterCard);
  addField(lines, 'twitter:site', result.twitterSite);
  addField(lines, 'twitter:title', result.twitterTitle);
  addField(lines, 'twitter:description', result.twitterDescription);
  addImageFields(lines, 'twitter:image', result.twitterImage?.[0]);

  // Article
  addField(lines, 'article:modified_time', result.articleModifiedTime);
  addField(lines, 'article:published_time', result.articlePublishedTime);
  addField(lines, 'article:publisher', result.articlePublisher);
  addField(lines, 'article:author', result.articleAuthor);

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
