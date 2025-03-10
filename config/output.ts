import { type AstroUserConfig } from 'astro';

/**
 * Output mode for the Astro build process.
 * - 'static': Pre-renders (SSG) all pages at build time into HTML files (default).
 * - 'server': Use server-side rendering (SSR) for all pages by default, 
 *    always outputting a server-rendered site.
 * - The 'server' mode is used when preview mode is enabled, allowing dynamic SSR.
 * Overriding individual pages to use SSR or SSG is possible by adding 
 * `export const prerender = true // or false;` to a route.
 * @see https://docs.astro.build/en/reference/configuration-reference/#output
 */
export const output = 'static' as const satisfies AstroUserConfig['output'];
