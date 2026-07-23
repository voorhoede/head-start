import { defineConfig, envField, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import graphql from '@rollup/plugin-graphql';
import sitemap from '@astrojs/sitemap';
import Sonda from 'sonda/astro';
import { loadEnv, type PluginOption } from 'vite';
import pkg from './package.json';
import { isPreview } from './config/preview';
import { output } from './config/output';
import serviceWorker from './config/astro/service-worker-integration.ts';

// Astro build/dev prerenders in Cloudflare's `workerd` runtime, which reads
// local secrets from `.dev.vars`, not `.env`. To keep `.env` the single source
// of truth, we load it here and feed the values into the `astro:env` defaults below.
// In CI (Workers Builds) no `.env` file exists, so `process.env` — populated by the CI — wins.
const dotEnv = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
const env = (key: string) => process.env[key] ?? dotEnv[key];

const isAnalyseMode = process.env.ANALYZE === 'true';
// Vitest loads this config via `getViteConfig`. The Cloudflare adapter's Vite
// plugin (v13+) rejects the Node.js `resolve.external` list Astro sets on the
// SSR environment, so we skip the adapter during tests, which don't render pages.
const isTest = process.env.VITEST === 'true';
const productionUrl = `https://${pkg.name}.voorhoede.workers.dev`; // overwrite if you have a custom domain
const localhostPort = 4323; // 4323 is "head" in T9

// Workers Builds injects WORKERS_CI=1 and WORKERS_CI_BRANCH but has no per-deploy
// preview URL equivalent to CF_PAGES_URL, so non-main branches fall back to productionUrl.
export const siteUrl = process.env.WORKERS_CI
  ? productionUrl
  : `http://localhost:${localhostPort}`;

// https://astro.build/config
export default defineConfig({
  adapter: isTest
    ? undefined
    : cloudflare({
      imageService: 'compile',
    }),
  env: {
    schema: {
      DATOCMS_READONLY_API_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        default: env('DATOCMS_READONLY_API_TOKEN')
      }),
      HEAD_START_PREVIEW_SECRET: envField.string({
        context: 'server',
        access: 'secret',
        default: env('HEAD_START_PREVIEW_SECRET')
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
  output: (isPreview && !isTest) ? 'server' : output, // @see `/config/output.ts``
  server: { port: localhostPort },
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
