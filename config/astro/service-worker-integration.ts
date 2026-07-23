import type { AstroIntegration } from 'astro';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import type { Plugin } from 'vite';

const filenamePath = (filename: string) => fileURLToPath(new URL(join('../../', filename), import.meta.url));
const srcFilename = filenamePath('src/assets/service-worker.ts');
const outFilename = filenamePath('dist/service-worker.js');

const buildConfig = {
  entryPoints: [srcFilename],
  outfile: outFilename,
  target: ['es2020'],
  bundle: true,
  minify: true,
  allowOverwrite: true,
  sourcemap: true,
};

/**
 * Serves `/service-worker.js` during `astro dev`.
 *
 * We run esbuild in a Vite dev middleware rather than an on-demand Astro route
 * because, since Astro 6 + `@astrojs/cloudflare` v13, dev routes execute in the
 * Cloudflare `workerd` runtime. esbuild relies on Node APIs (e.g. `__filename`)
 * that don't exist there. Vite's dev server middleware still runs in Node.
 */
function serviceWorkerDevPlugin(): Plugin {
  return {
    name: 'service-worker-dev',
    apply: 'serve',
    enforce: 'pre',
    configureServer(server) {
      server.watcher.add(srcFilename);
      const handle = async (
        _req: unknown,
        res: import('node:http').ServerResponse,
        next: (err?: unknown) => void,
      ) => {
        try {
          const output = await esbuild.build({
            ...buildConfig,
            write: false,
            minify: false,
            sourcemap: false,
          });
          res.setHeader('Content-Type', 'application/javascript');
          res.end(output.outputFiles[0].text);
        } catch (e) {
          next(e);
        }
      };
      // Prepend to the middleware stack so this runs before the Cloudflare
      // plugin's catch-all, which otherwise forwards `/service-worker.js` to
      // `workerd` and 404s.
      server.middlewares.stack.unshift({ route: '/service-worker.js', handle });
    },
  };
}

export default function serviceWorkerIntegration(): AstroIntegration {
  return {
    name: 'service-worker',
    hooks: {
      'astro:config:setup': async ({ command, updateConfig }) => {
        const isDevelopment = command === 'dev';
        if (isDevelopment) {
          updateConfig({ vite: { plugins: [serviceWorkerDevPlugin()] } });
        }
      },
      'astro:build:done': async () => {
        try {
          await esbuild.build({
            ...buildConfig,
            write: true,
          });
        } catch (e) {
          console.error('Failed to build service worker');
          console.error(e);
          process.exit(1);
        }
      },
    },
  };
}
