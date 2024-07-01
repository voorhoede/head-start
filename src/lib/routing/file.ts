import type { FileLinkFragment } from '@lib/types/datocms';

export const getFileLinkHref = (link: FileLinkFragment) => {
  if (link.slug) {
    return link.slug;
  } else {
    return link.file.url.replace('https://www.datocms-assets.com/', '/files/');
  }
};
