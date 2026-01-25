module.exports = {
  testEnvironment: 'node',
  rootDir: '..',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'public/**/*.js',
    '!public/**/*.test.js',
    '!public/main.js',
    '!public/preload.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true
};
