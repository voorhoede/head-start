/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    // Vitest configuration options
    teardownTimeout: 1000,
    reporters: process.env.GITHUB_ACTIONS ? ['dot', 'github-actions'] : ['dot'],
  }
});

// import { defineConfig } from 'vitest/config';

// export default defineConfig({
//   test: {
//     reporters: process.env.GITHUB_ACTIONS ? ['dot', 'github-actions'] : ['dot'],
//   },
// });
