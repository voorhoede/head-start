const MARKDOWN_API_PREFIX = '/api/content/';
const MARKDOWN_SUFFIX = '.md';

const splitPathname = (pathname: string): { path: string; suffix: string } => {
  const [pathQuery, hash = ''] = pathname.split('#');
  const [path, query = ''] = pathQuery.split('?');
  const suffix = (query ? `?${query}` : '') + (hash ? `#${hash}` : '');
  return { path, suffix };
};

export const htmlToMarkdownPath = (pathname: string): string => {
  const { path, suffix } = splitPathname(pathname);
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  const mdPath = trimmed
    ? `${MARKDOWN_API_PREFIX}${trimmed}${MARKDOWN_SUFFIX}`
    : `${MARKDOWN_API_PREFIX}${MARKDOWN_SUFFIX}`;
  return `${mdPath}${suffix}`;
};

export const markdownToHtmlPath = (pathname: string): string => {
  const { path, suffix } = splitPathname(pathname);
  if (!path.startsWith(MARKDOWN_API_PREFIX)) return `${path}${suffix}`;
  let inner = path.slice(MARKDOWN_API_PREFIX.length);
  if (inner.endsWith(MARKDOWN_SUFFIX)) inner = inner.slice(0, -MARKDOWN_SUFFIX.length);
  const htmlPath = inner ? `/${inner}/` : '/';
  return `${htmlPath}${suffix}`;
};

export const isMarkdownApiPath = (pathname: string): boolean => {
  const { path } = splitPathname(pathname);
  return path.startsWith(MARKDOWN_API_PREFIX) && path.endsWith(MARKDOWN_SUFFIX);
};
