import type { APIRoute, AstroIntegration } from 'astro';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const serviceWorkerSrc = fileURLToPath(new URL('../../src/assets/service-worker.ts', import.meta.url));
const serviceWorkerDist = fileURLToPath(new URL('../../dist/service-worker.js', import.meta.url));

export default function serviceWorkerIntegration(): AstroIntegration {
  return {
    name: 'service-worker',
    hooks: {
      'astro:config:setup': async ({
        command,
        injectRoute,
        addWatchFile,
      }) => {
        const isDevelopment = command === 'dev';
        if (isDevelopment) {
          addWatchFile(serviceWorkerSrc);
          injectRoute({
            pattern: '/service-worker.js',
            entrypoint: import.meta.url,
          });
        }
      },
      'astro:build:done': async () => {
        try {
          await esbuild.build({
            entryPoints: [serviceWorkerSrc],
            outfile: serviceWorkerDist,
            target: ['es2020'],
            bundle: true,
            minify: true,
            allowOverwrite: true,
            sourcemap: true,
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

export const GET: APIRoute = async () => {
  const output =  await esbuild.build({
    entryPoints: [serviceWorkerSrc],
    outdir: serviceWorkerDist,
    target: ['es2020'],
    bundle: true,
    minify: false,
    write: false,
    allowOverwrite: true,
    sourcemap: false,
  });

  return new Response(output.outputFiles[0].contents, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript',
    },
  });
};
