import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import parser from 'astro-eslint-parser';
import tsParser from '@typescript-eslint/parser';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default defineConfig([{
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.browser,
    },

    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: {},
  },

  extends: compat.extends('eslint:recommended', 'plugin:astro/recommended'),

  rules: {
    indent: ['warn', 2],
    quotes: ['warn', 'single'],
    'object-curly-spacing': ['warn', 'always'],
    'no-unused-vars': ['warn', {
      varsIgnorePattern: '^Props$',
    }],
    semi: ['warn', 'always'],
  },
}, globalIgnores(['dist/*', 'functions/*', 'node_modules/*']), {
  files: ['**/*.astro'],

  languageOptions: {
    parser: parser,

    parserOptions: {
      parser: '@typescript-eslint/parser',
      extraFileExtensions: ['.astro'],
    },
  },

  rules: {},
}, {
  files: ['**/*.ts'],

  languageOptions: {
    parser: tsParser,
  },

  extends: compat.extends('plugin:@typescript-eslint/recommended'),

  rules: {
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
    }],

    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/triple-slash-reference': 'off',
  },
}, globalIgnores([
  '_eslint.config.ts',
  '**/dist',
  '**/node_modules',
  '**.astro/**',
  'src/lib/datocms/types.ts',
  '!**/.graphqlrc.ts',
])]);
