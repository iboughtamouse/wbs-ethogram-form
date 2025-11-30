import '@testing-library/jest-dom';

// Mock envConfig globally to avoid import.meta.env parse errors in Jest
// Jest cannot parse import.meta syntax, so we mock the entire module
jest.mock('./src/utils/envConfig', () => ({
  getEnv: (key) => {
    const envVars = {
      VITE_WBS_EMAIL: 'test-wbs@example.com',
      VITE_API_BASE_URL: 'http://localhost:3000',
    };
    return envVars[key];
  },
  getWBSEmail: () => 'test-wbs@example.com',
  getApiBaseUrl: () => 'http://localhost:3000',
}));
