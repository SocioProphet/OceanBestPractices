module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
    'plugin:unicorn/recommended',
    'plugin:promise/recommended',
  ],
  rules: {
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      },
    ],
    'function-paren-newline': [
      'error',
      'multiline-arguments',
    ],
    'implicit-arrow-linebreak': 'off',
    'max-len': [
      'error',
      {
        code: 80,
        tabWidth: 2,
        ignorePattern: '(test\\(|https?://)',
        ignoreTemplateLiterals: true,
        ignoreStrings: true,
      },
    ],
    'no-console': 'off',
    'object-property-newline': [
      'error',
      { allowAllPropertiesOnSameLine: false },
    ],
    radix: ['error', 'as-needed'],
    'unicorn/custom-error-definition': 'error',
    'unicorn/no-unsafe-regex': 'error',
    'unicorn/no-unused-properties': 'error',
    'unicorn/prefer-module': 'off',
    'unicorn/prefer-node-protocol': 'off',
    'unicorn/prevent-abbreviations': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_' },
    ],
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: [
        '@typescript-eslint',
        'import-newlines',
      ],
      extends: [
        'plugin:@typescript-eslint/recommended',
      ],
      settings: { 'import/resolver': 'node' },
      rules: {
        'dot-notation': 'off',
        'import/extensions': 'off',
        'import/no-extraneous-dependencies': [
          'error',
          { devDependencies: ['**/*.test.ts'] },
        ],
        'import/no-unresolved': 'off',
        'import-newlines/enforce': [
          'error',
          {
            items: 1,
            'max-len': 80,
          },
        ],
      },
    },
    {
      files: [
        'bin/*.ts',
        'cdk/**/*.ts',
      ],
      rules: {
        'no-new': 'off',
        '@typescript-eslint/ban-types': [
          'error',
          { types: { Function: false } },
        ],
        'unicorn/import-style': [
          'error',
          {
            styles: {
              path: {
                namespace: true,
              },
            },
          },
        ],
      },
    },
    {
      files: ['website/**'],
      env: {
        browser: true,
        node: false,
      },
    },
  ],
};
