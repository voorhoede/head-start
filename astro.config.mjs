import { defineConfig } from 'astro/config';
import cloudflare from "@astrojs/cloudflare";
import graphql from "@rollup/plugin-graphql";

const localhostPort = 4323; // 4323 is "head" in T9
const isPreview = process.env.HEAD_START_PREVIEW === "true";

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare({
    mode: "directory",
    functionPerRoute: true,
    runtime: {
      mode: "local",
    },
  }),
  output: isPreview ? "server" : "hybrid",
  server: { port: localhostPort },
  site: process.env.CF_PAGES
    ? process.env.CF_PAGES_URL
    : `http://localhost:${localhostPort}`,
  trailingSlash: "always",
  vite: {
    plugins: [graphql()],
  },
});
