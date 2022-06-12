module.exports = {
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module',
  },
  extends: ['plugin:jsdoc/recommended'],
  rules: {
    'jsdoc/newline-after-description': [1, 'never'],
    'jsdoc/no-undefined-types': 0,
  },
  plugins: ['jsdoc'],
}
