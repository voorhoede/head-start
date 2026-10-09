import type { Plugin } from 'esbuild';

/**
 * Keeps Shiki (about 10 MB of grammars and themes) out of the Bunny Edge Script, which may be at most 10 MB.
 * It only arrives through the default code node of `@datocms/astro`, which `src/components/Text/Text.astro` replaces.
 */
export const withoutShiki: Plugin = {
  name: 'without-shiki',
  setup(build) {
    build.onResolve({ filter: /^(@astrojs\/internal-helpers\/shiki|shiki\/langs)$/ }, ({ path }) => ({ path, namespace: 'without-shiki' }));
    build.onLoad({ filter: /.*/, namespace: 'without-shiki' }, () => ({
      loader: 'js',
      contents: `
        export const bundledLanguages = {};
        export const clearShikiHighlighterCache = () => {};
        export const createShikiHighlighter = () => {
          throw new Error('Shiki is not bundled into the Edge Script; render code blocks with src/components/Text/nodes/Code.astro');
        };
      `,
    }));
  },
};
