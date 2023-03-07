module.exports = {
  root: true,
  env: {
    'jest': true,
    'browser': true,
    'node': true,
    'es6': true,
  },
  extends: [
    'eslint:recommended',
    'google',
    'plugin:jest/recommended',
    'plugin:jest/style',
  ],
  parserOptions: {
    'ecmaVersion': 2022,
    'sourceType': 'module',
  },
  plugins: ['jest'],
  rules: {
    'require-jsdoc': 'off',
    'max-len': ['error', {
      'ignoreStrings': true,
      'ignoreTemplateLiterals': true,
      'ignoreRegExpLiterals': true,
      'ignoreUrls': true,
      'code': 120,
    }],
    'jest/no-disabled-tests': ['error'],
  },
};
