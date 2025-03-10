import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        Buffer: 'readonly',
        process: 'readonly',
        chrome: 'readonly',
        document: 'readonly',
        window: 'readonly',
        fetch: 'readonly',
        WebSocket: 'readonly',
        Event: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLSpanElement: 'readonly',
        HTMLButtonElement: 'readonly',
        alert: 'readonly',
        NodeJS: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'import/extensions': 'off',
      'no-case-declarations': 'off'
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    }
  },
  {
    files: ['packages/core/**/*.ts', 'packages/browser-extension/**/*.ts', 'packages/mcp-server/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['*.js'],
              message: 'Do not use .js extension in imports',
            },
          ],
        },
      ],
    },
  },
]; 