import 'jiti/register';
import ts from 'typescript-eslint';
import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import depend from 'eslint-plugin-depend';

const config = ts.config([
  js.configs.recommended,
  ts.configs.recommended,
  astro.configs['flat/recommended'],
  astro.configs['flat/jsx-a11y-strict'],  
  // @ts-expect-error - depend plugin does not have correct flat config types
  depend.configs['flat/recommended'],
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    rules: {
      indent: ['warn', 2],
      quotes: ['warn', 'single'],
      semi: ['warn', 'always'],
      'object-curly-spacing': ['warn', 'always'],
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' }],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
    }
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

export default config;
