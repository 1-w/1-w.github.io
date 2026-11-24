import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: [
      'dist',
      'playwright-report',
      'test-results',
      'js',
      'css',
      'fonts',
      '.claude',
      '.superpowers',
    ],
  },
  tseslint.configs.recommended,
  {
    rules: {
      complexity: ['error', 10],
      'max-statements': ['error', 40],
      'max-depth': ['error', 4],
    },
  },
);
