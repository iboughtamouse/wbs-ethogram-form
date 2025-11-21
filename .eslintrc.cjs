module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true, jest: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'coverage', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Relax some rules to warnings for gradual adoption
    'no-unused-vars': 'warn',
    'react/no-unescaped-entities': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'warn',
    'react/prop-types': 'warn',
  },
  overrides: [
    {
      // Test files have different linting needs
      files: ['**/*.test.js', '**/*.test.jsx', 'tests/**/*'],
      rules: {
        // PropTypes not needed in test mocks
        'react/prop-types': 'off',
        // Unused vars in tests often intentional (setup, mocks)
        'no-unused-vars': 'off',
        // Console logs acceptable for test debugging
        'no-console': 'off',
      },
    },
  ],
}
