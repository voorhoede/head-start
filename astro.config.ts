import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import graphql from '@rollup/plugin-graphql';
import sitemap from '@astrojs/sitemap';
import type { PluginOption } from 'vite';

const localhostPort = 4323; // 4323 is "head" in T9
export const siteUrl = process.env.CF_PAGES
  ? process.env.CF_PAGES_URL
  : `http://localhost:${localhostPort}`;

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare({
    mode: 'directory',
    functionPerRoute: true,
    runtime: {
      mode: 'local',
      type: 'pages',
    },
  }),
  integrations: [sitemap()],
  output: 'hybrid',
  server: { port: localhostPort },
  site: siteUrl,
  trailingSlash: 'always',
  vite: {
    plugins: [
      graphql() as PluginOption,
    ],
  },
});
