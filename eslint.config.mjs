import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import depend from 'eslint-plugin-depend';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig([
  js.configs.recommended,
  ...ts.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ['**/*.js', '**/*.ts', '**/*.astro'],
    plugins: {
      depend,
    },
    extends: ['depend/flat/recommended'],
  },
  {
    plugins: {
      '@stylistic': stylistic,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      '@stylistic/indent': ['warn', 2],
      '@stylistic/quotes': ['warn', 'single'],
      '@stylistic/semi': ['warn', 'always'],
      '@stylistic/object-curly-spacing': ['warn', 'always'],
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      'no-unused-vars': ['off'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
  globalIgnores([
    '**/.astro/**',
    '.agents/skills/**',
    'dist/*',
    'functions/*',
    'src/lib/datocms/types.ts',
    '!**/.graphqlrc.ts',
  ]),
]);
