import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { buildFrontmatter } from '~/lib/frontmatter';
import type { PageMeta } from '~/lib/rehype/rehype-extract-meta';
import rehypeExtractMeta from '~/lib/rehype/rehype-extract-meta';
import rehypeExtractNoindex from '~/lib/rehype/rehype-extract-noindex';
import rehypeExtractMain from '~/lib/rehype/rehype-extract-main';

export interface HtmlToMarkdownOptions {
  /** Canonical URL of the page, used for frontmatter and as a fallback. */
  url: string;
  /** Locale code (e.g. `en`), used to derive the human-readable language name. */
  localeCode?: string;
}

export interface HtmlToMarkdownResult {
  md: string;
  noindex: boolean;
}

/**
 * Convert a full rendered HTML page into a Markdown document with YAML frontmatter.
 * Extracts page meta (title/description/url), drops everything outside `<main>`,
 * and honours a `noindex` directive surfaced via {@link rehypeExtractNoindex}.
 */
export async function htmlToMarkdown(
  html: string,
  { url, localeCode }: HtmlToMarkdownOptions,
): Promise<HtmlToMarkdownResult> {
  const result = await unified()
    .use(rehypeParse)
    .use(rehypeExtractMeta)
    .use(rehypeExtractNoindex)
    .use(rehypeExtractMain)
    .use(rehypeRemark)
    .use(remarkGfm)
    .use(remarkStringify)
    .process(html);

  const noindex = Boolean(result.data.noindex);
  const meta = (result.data.meta ?? {}) as PageMeta;

  let language: string | undefined;
  if (localeCode) {
    try {
      language = new Intl.DisplayNames(['en'], { type: 'language' }).of(localeCode);
    } catch {
      language = undefined;
    }
  }

  const frontmatter = buildFrontmatter({ meta, url, language });
  return { md: frontmatter + String(result), noindex };
}

/**
 * Rough token estimate for the `x-markdown-tokens` / `x-original-tokens` headers.
 * We have no tokenizer at the edge, so approximate ~4 characters per token,
 * matching the heuristic commonly used for English text.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
