import type { APIRoute, AstroIntegration } from 'astro';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const filenamePath = (filename: string) => fileURLToPath(new URL(join('../../', filename), import.meta.url));
const srcFilename = filenamePath('src/assets/service-worker.ts');
const outFilename = filenamePath('dist/service-worker.js');

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
          addWatchFile(srcFilename);
          injectRoute({
            pattern: '/service-worker.js',
            entrypoint: import.meta.url,
          });
        }
      },
      'astro:build:done': async () => {
        try {
          await esbuild.build({
            entryPoints: [srcFilename],
            outfile: outFilename,
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
    entryPoints: [srcFilename],
    outdir: outFilename,
    target: ['es2020'],
    bundle: true,
    minify: false,
    write: false,
    allowOverwrite: true,
    sourcemap: false,
  });

  return new Response('x' + output.outputFiles[0].contents, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript',
    },
  });
};
