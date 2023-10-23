import { defineConfig } from 'astro/config';
import graphql from '@rollup/plugin-graphql';

// https://astro.build/config
export default defineConfig({
  server: { port: 4323 }, // 4323 is "head" in T9
  vite: {
    plugins: [graphql()]
  }
})
