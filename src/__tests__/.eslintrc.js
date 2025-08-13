module.exports = {
  root: false,
  extends: ['../../.eslintrc.js'],
  env: {
    jest: true,
    node: true
  },
  rules: {
    // Règles spécifiques pour les tests
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-empty-function': 'off'
  }
};
