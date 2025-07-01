import "@testing-library/jest-dom";

// Global test utilities
global.fetch = jest.fn();

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
