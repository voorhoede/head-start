import type { GlobalSetupContext } from 'vitest/node';

export default function setup({ provide }: GlobalSetupContext) {
  // @todo: configure baseUrl based on environment (local dev vs Cloudflare deployment)
  provide('baseUrl', 'http://localhost:8788');
}

declare module 'vitest' {
  export interface ProvidedContext {
    baseUrl: string
  }
}
