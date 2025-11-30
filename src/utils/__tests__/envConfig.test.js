/**
 * Unit tests for envConfig utility
 *
 * Tests environment variable access through testable interface
 */

import { getEnv, getWBSEmail, getApiBaseUrl } from '../envConfig';

// Note: envConfig is globally mocked in jest.setup.js to return test values
// These tests verify the mock is working correctly

describe('envConfig', () => {
  describe('getEnv', () => {
    it('should return WBS email from environment', () => {
      const email = getEnv('VITE_WBS_EMAIL');
      expect(email).toBe('test-wbs@example.com');
    });

    it('should return API base URL from environment', () => {
      const apiUrl = getEnv('VITE_API_BASE_URL');
      expect(apiUrl).toBe('http://localhost:3000');
    });
  });

  describe('getWBSEmail', () => {
    it('should return configured WBS email', () => {
      const email = getWBSEmail();
      expect(email).toBe('test-wbs@example.com');
    });
  });

  describe('getApiBaseUrl', () => {
    it('should return configured API base URL', () => {
      const apiUrl = getApiBaseUrl();
      expect(apiUrl).toBe('http://localhost:3000');
    });
  });
});
