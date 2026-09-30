import { defineConfig, envField, fontProviders } from 'astro/config';
import bunny from '@bunny.net/astro-adapter';
import graphql from '@rollup/plugin-graphql';
import sitemap from '@astrojs/sitemap';
import Sonda from 'sonda/astro';
import { type PluginOption } from 'vite';
import pkg from './package.json';
import { isPreview } from './config/preview';
import { output } from './config/output';
import serviceWorker from './config/astro/service-worker-integration.ts';
import { withoutShiki } from './config/astro/without-shiki.ts';

const isAnalyseMode = process.env.ANALYZE === 'true';
const productionUrl = `https://${pkg.name}.b-cdn.net`; // overwrite if you have a custom domain
const localhostPort = 4323; // 4323 is "head" in T9

// The deploy workflow builds on GitHub Actions and has no per-branch preview URL,
// so every CI build uses productionUrl.
export const siteUrl = process.env.GITHUB_ACTIONS
  ? productionUrl
  : `http://localhost:${localhostPort}`;

// https://astro.build/config
export default defineConfig({
  adapter: bunny({
    sessions: false,
    // The adapter lists client files before @astrojs/sitemap and the service worker integration write theirs.
    assetManifest: false,
    esbuild: (options) => ({ ...options, plugins: [...(options.plugins ?? []), withoutShiki] }),
  }),
  env: {
    schema: {
      DATOCMS_READONLY_API_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
      }),
      HEAD_START_PREVIEW_SECRET: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      HEAD_START_PREVIEW: envField.boolean({
        context: 'server',
        access: 'secret',
        default: isPreview
      }),
      PUBLIC_IS_PRODUCTION: envField.boolean({
        context: 'server',
        access: 'public',
        default: process.env.NODE_ENV === 'production'
      })
    }
  },
  fonts: [{
    name: 'Archivo',
    cssVariable: '--font-archivo',
    provider: fontProviders.fontsource(),
    weights: [400, 600],
    styles: ['normal'],
    subsets: ['latin'],
  }],
  integrations: [
    serviceWorker(),
    sitemap(),
    Sonda({
      enabled: isAnalyseMode,
      filename: 'reports/sonda-report-[env].html',
      server: true,
    }),
  ],
  output: isPreview ? 'server' : output, // @see `/config/output.ts``
  server: { port: localhostPort },
  session: false,
  site: siteUrl,
  vite: {
    build: {
      sourcemap: isAnalyseMode,
    },
    plugins: [
      graphql() as PluginOption,
    ],
    optimizeDeps: {
      exclude: ['msw'],
    }
  },
});
