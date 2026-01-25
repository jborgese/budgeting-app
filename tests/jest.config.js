module.exports = {
  testEnvironment: 'node',
  rootDir: '..',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'public/**/*.js',
    '!public/**/*.test.js',
    '!public/main.js',
    '!public/preload.js',
    // DOM manipulation/UI logic - requires browser environment
    '!public/app.js',
    // Documentation and example code
    '!public/stateExamples.js',
    // Data files - no logic to test
    '!public/taxBrackets.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true
};
