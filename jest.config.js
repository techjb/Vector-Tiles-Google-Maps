export default {
  transform: {},
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^\\$/(.*)$': '<rootDir>/tests/$1',
  },
  setupFiles: [
    '<rootDir>/tests/setup.js',
  ],
};
