/* eslint-disable no-underscore-dangle */
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    env: {
      browser: true,
      es2022: true,
    },
    extends: [
      'next/core-web-vitals',
      'next/typescript',
      'airbnb',
      'plugin:react/recommended',
      'plugin:react/jsx-runtime',
      'plugin:prettier/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:import/typescript',
      'plugin:react-hooks/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    globals: {
      JSX: true,
    },
    ignorePatterns: [
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/__tests__/**/*.ts',
      '**/__tests__/**/*.tsx',
      '**/*.test.ts',
      '**/*.test.tsx',
    ],
    plugins: ['unused-imports'],
    rules: {
      '@next/next/no-img-element': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          ts: 'never',
          tsx: 'never',
        },
      ],
      'react/jsx-filename-extension': [
        'error',
        {
          extensions: ['.tsx'],
        },
      ],
      'react/jsx-first-prop-new-line': ['error', 'multiline'],
      'react/jsx-max-props-per-line': [
        'error',
        {
          maximum: 1,
          when: 'always',
        },
      ],
      'react/jsx-indent-props': ['error', 2],
      'react/jsx-closing-bracket-location': ['error', 'tag-aligned'],
      'react/jsx-fragments': ['error', 'element'],
      'react/button-has-type': 'off',
      'react/require-default-props': [
        'error',
        {
          functions: 'defaultArguments',
        },
      ],
      'jsx-a11y/label-has-associated-control': [
        1,
        {
          assert: 'either',
        },
      ],
      'max-len': [
        'error',
        {
          code: 100,
          tabWidth: 2,
          ignoreComments: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreUrls: true,
        },
      ],
      'no-multiple-empty-lines': [
        'error',
        {
          max: 1,
          maxEOF: 1,
          maxBOF: 0,
        },
      ],
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': ['error'],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'unused-imports/no-unused-imports': 'error',
      'no-param-reassign': [
        'error',
        {
          props: false,
        },
      ],
      'no-unused-expressions': 0,
      'no-use-before-define': 0,
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'parent',
            'internal',
            'sibling',
            'index',
          ],
          alphabetize: {
            order: 'asc',
            caseInsensitive: false,
          },
        },
      ],
      'import/no-extraneous-dependencies': 0,
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'import/prefer-default-export': 'off',
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
    },
  }),
];

export default eslintConfig;
