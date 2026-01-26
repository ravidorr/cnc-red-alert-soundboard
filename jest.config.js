export default {
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.js'],
    collectCoverageFrom: [
        'js/**/*.js',
        '!js/main.js',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
    },
    transform: {},
};
