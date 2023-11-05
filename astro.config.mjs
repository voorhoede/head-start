import { defineConfig } from 'astro/config';
import cloudflare from "@astrojs/cloudflare";
import graphql from "@rollup/plugin-graphql";

// https://astro.build/config
export default defineConfig({
  server: {
    port: 4323,
  },
  // 4323 is "head" in T9
  vite: {
    plugins: [graphql()],
  },
  output: "hybrid",
  adapter: cloudflare({
    mode: "directory",
    functionPerRoute: true,
  }),
});
