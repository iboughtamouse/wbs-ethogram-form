import '@testing-library/jest-dom';

// Set environment variables for tests
// Note: We use process.env instead of mocking import.meta because
// Jest's parser doesn't support import.meta syntax
process.env.VITE_WBS_EMAIL = 'test-wbs@example.com';
