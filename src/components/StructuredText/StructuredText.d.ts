import type { Node } from 'datocms-structured-text-utils';

// based on https://github.com/datocms/datocms-svelte/blob/main/src/lib/index.ts
export type PredicateComponentTuple = [
  (n: Node) => boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((_props: Props) => any) | ((_props: Record<string, any>) => any),
];
