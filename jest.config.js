/**
 * Jest configuration for the project
 * 
 * This configures Jest to:
 * - Use ts-jest preset for TypeScript support
 * - Run tests in jsdom environment for DOM testing
 * - Handle TypeScript and JavaScript file extensions
 * - Transform TypeScript files using ts-jest
 * - Match test files using standard naming patterns
 * - Map module imports starting with @ to the root directory
 * - Load setup file for additional test configuration
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}; 