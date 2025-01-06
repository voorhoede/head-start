import type { FileRouteFragment } from '@lib/datocms/types';
import { datocmsAssetsOrigin } from '@lib/datocms';
import fileProxyMapUntyped from './file-proxy-map.json';

export const getFileHref = (record: FileRouteFragment) => {
  if (record.customSlug) {
    return record.customSlug;
  }

  return record.file.url.replace(datocmsAssetsOrigin, '/files/');
};

type FileProxyMap = {
  [key: string]: string;
};
const fileProxyMap = fileProxyMapUntyped as FileProxyMap;

export const getFileUrlBySlug = (slug: string) => {
  return fileProxyMap[slug];
};
