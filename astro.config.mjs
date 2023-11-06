import { defineConfig } from 'astro/config';
import graphql from '@rollup/plugin-graphql';

const localhostPort = 4323; // 4323 is "head" in T9

// https://astro.build/config
export default defineConfig({
  server: { port: localhostPort },
  site: process.env.CF_PAGES
    ? process.env.CF_PAGES_URL
    : `http://localhost:${localhostPort}`,
  trailingSlash: "always",
  vite: {
    plugins: [graphql()],
  },
});
