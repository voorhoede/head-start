import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: './vitest.config.ts',
    test: {
      name: 'unit',
      include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    }
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'integration',
      include: ['tests/integration/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
      globalSetup: './tests/globalSetup.ts',
    }
  }
]);
