module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '\\.expo/'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'lib/**/*.ts',
    'components/**/*.{ts,tsx}',
  ].filter(Boolean),
};
