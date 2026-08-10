import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
  ...nextVitals,
  eslintConfigPrettier,
  {
    rules: {
      '@next/next/no-img-element': 'off',
      'jsx-a11y/alt-text': 'off',
      'react/display-name': 'off',
      'react-hooks/exhaustive-deps': 'off',
      // New React Hooks 7 rules from Next 16 — too noisy for existing Pages Router patterns
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/purity': 'off',
      'react/no-unescaped-entities': 'off',
      'react/jsx-max-props-per-line': [
        1,
        {
          maximum: 2,
          when: 'multiline',
        },
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'react/jsx-sort-props': 'off',
      'react-hooks/rules-of-hooks': 'error',
    },
    settings: {
      'import/resolver': {
        typescript: true,
      },
    },
  },
  globalIgnores([
    '.next/**',
    'node_modules/**',
    'build/**',
    'dist/**',
    'coverage/**',
    'next-env.d.ts',
  ]),
]);
