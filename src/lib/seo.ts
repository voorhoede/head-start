import type { Tag } from './types/datocms';

export const noIndexTag: Tag = { attributes: { name: 'robots' }, content: 'noindex', tag: 'meta' };

export const titleTag = (title:string): Tag => ({ tag: 'title', content: title });
