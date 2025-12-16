const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/page-components/(.*)$': '<rootDir>/src/page-components/$1',
    '^@/widgets/(.*)$': '<rootDir>/src/widgets/$1',
    '^@/features/(.*)$': '<rootDir>/src/features/$1',
    '^@/entities/(.*)$': '<rootDir>/src/entities/$1',
    '^@/shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@/store/(.*)$': '<rootDir>/src/store/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
};

module.exports = createJestConfig(customJestConfig);
