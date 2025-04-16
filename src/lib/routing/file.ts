import type { FileRouteFragment } from '@lib/datocms/types';
import { datocmsAssetsOrigin } from '@lib/datocms';
import fileProxyMapUntyped from './file-proxy-map.json';

export const getFileHref = (record: FileRouteFragment) => {
  if (record.path) {
    return record.path;
  }

  return record.file.url.replace(datocmsAssetsOrigin, '/files/');
};

type FileProxyMap = {
  [key: string]: string;
};

const fileProxyMap: FileProxyMap = fileProxyMapUntyped;

export const getFileUrlByPath = (path: string) => {
  return fileProxyMap[path];
};
