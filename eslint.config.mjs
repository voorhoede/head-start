import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import astro from 'eslint-plugin-astro';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  js.configs.recommended,
  astro.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {},
    },

    rules: {
      indent: ['warn', 2],
      quotes: ['warn', 'single'],
      'object-curly-spacing': ['warn', 'always'],
      'no-unused-vars': ['warn'],
      semi: ['warn', 'always'],
    },
  },
  {
    files: ['**/*.ts'],

    languageOptions: {
      parser: tsParser,
    },

    extends: compat.extends('plugin:@typescript-eslint/recommended'),

    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
  {
    ignores: [
      '**.astro/**', 
      'dist/*', 
      'functions/*', 
      'src/lib/datocms/types.ts',
      '!**/.graphqlrc.ts'
    ]
  }
]);
