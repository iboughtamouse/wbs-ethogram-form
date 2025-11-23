import {
  submitObservation,
  isRetryableError,
  getErrorMessage,
  ERROR_TYPES,
} from '../emailService';

describe('emailService', () => {
  const mockFormData = {
    metadata: {
      observerName: 'Test Observer',
      date: '2025-11-22',
      startTime: '15:00',
      endTime: '15:30',
      aviary: "Sayyida's Cove",
      patient: 'Sayyida',
      mode: 'live',
    },
    observations: {
      '15:00': {
        behavior: 'resting_alert',
        location: '5',
        notes: 'Test notes',
      },
    },
    submittedAt: '2025-11-22T21:00:00.000Z',
  };

  const mockEmails = ['test@example.com'];

  describe('submitObservation - Mock Implementation (Phase 1)', () => {
    beforeEach(() => {
      jest.spyOn(Math, 'random');
    });

    afterEach(() => {
      Math.random.mockRestore();
    });

    it('should return success response with submission ID', async () => {
      // Mock random to avoid simulated errors
      Math.random.mockReturnValue(0.9);

      const result = await submitObservation(mockFormData, mockEmails);

      expect(result.success).toBe(true);
      expect(result.submissionId).toBeTruthy();
      expect(result.submissionId).toContain('mock-');
      expect(result.message).toBe('Observation submitted successfully');
      expect(result.emailsSent).toBe(1);
    });

    it('should include number of emails sent', async () => {
      Math.random.mockReturnValue(0.9);

      const multipleEmails = ['test1@example.com', 'test2@example.com'];
      const result = await submitObservation(mockFormData, multipleEmails);

      expect(result.success).toBe(true);
      expect(result.emailsSent).toBe(2);
    });

    it('should generate unique submission IDs', async () => {
      Math.random.mockReturnValue(0.9);

      const result1 = await submitObservation(mockFormData, mockEmails);
      const result2 = await submitObservation(mockFormData, mockEmails);

      expect(result1.submissionId).not.toBe(result2.submissionId);
    });

    it('should simulate network timeout error', async () => {
      // Math.random() is called in this order:
      // 1. For delay calculation (line 48)
      // 2. For network error check (line 55)
      Math.random.mockReturnValueOnce(0.5); // For delay calculation
      Math.random.mockReturnValueOnce(0.01); // Trigger network error (<0.05)

      const result = await submitObservation(mockFormData, mockEmails);

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_TYPES.TRANSIENT);
      expect(result.message).toContain('Network timeout');
      expect(result.retryable).toBe(true);
    });

    it('should simulate server error', async () => {
      // Math.random() is called in this order:
      // 1. For delay calculation (line 48)
      // 2. For network error check (line 55) - skip with >0.05
      // 3. For server error check (line 64) - trigger with <0.03
      Math.random.mockReturnValueOnce(0.5); // For delay calculation
      Math.random.mockReturnValueOnce(0.1); // Skip network error (>0.05)
      Math.random.mockReturnValueOnce(0.01); // Trigger server error (<0.03)

      const result = await submitObservation(mockFormData, mockEmails);

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_TYPES.TRANSIENT);
      expect(result.message).toContain('Service temporarily unavailable');
      expect(result.retryable).toBe(true);
    });

    it('should have network delay', async () => {
      Math.random.mockReturnValue(0.9);

      const startTime = Date.now();
      await submitObservation(mockFormData, mockEmails);
      const endTime = Date.now();

      const elapsed = endTime - startTime;
      // Should take at least 1 second (1000ms base + random up to 1000ms)
      expect(elapsed).toBeGreaterThanOrEqual(1000);
      expect(elapsed).toBeLessThan(2500); // Upper bound with buffer
    });
  });

  describe('isRetryableError', () => {
    it('should return true for transient errors', () => {
      const result = {
        success: false,
        error: ERROR_TYPES.TRANSIENT,
        message: 'Network error',
        retryable: true,
      };

      expect(isRetryableError(result)).toBe(true);
    });

    it('should return false for permanent errors', () => {
      const result = {
        success: false,
        error: ERROR_TYPES.PERMANENT,
        message: 'Quota exceeded',
        retryable: false,
      };

      expect(isRetryableError(result)).toBe(false);
    });

    it('should return false for validation errors', () => {
      const result = {
        success: false,
        error: ERROR_TYPES.VALIDATION,
        message: 'Invalid data',
        retryable: false,
      };

      expect(isRetryableError(result)).toBe(false);
    });

    it('should return false for successful results', () => {
      const result = {
        success: true,
        submissionId: 'mock-123',
        message: 'Success',
      };

      expect(isRetryableError(result)).toBe(false);
    });

    it('should return false when retryable flag is missing', () => {
      const result = {
        success: false,
        error: ERROR_TYPES.TRANSIENT,
        message: 'Error',
        // Missing retryable flag
      };

      expect(isRetryableError(result)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should return empty string for successful results', () => {
      const result = {
        success: true,
        submissionId: 'mock-123',
      };

      expect(getErrorMessage(result)).toBe('');
    });

    it('should return provided message when available', () => {
      const result = {
        success: false,
        error: ERROR_TYPES.TRANSIENT,
        message: 'Custom error message',
      };

      expect(getErrorMessage(result)).toBe('Custom error message');
    });

    it('should return default message for transient errors without message', () => {
      const result = {
        success: false,
        error: ERROR_TYPES.TRANSIENT,
      };

      expect(getErrorMessage(result)).toContain('temporarily unavailable');
    });

    it('should return default message for permanent errors without message', () => {
      const result = {
        success: false,
        error: ERROR_TYPES.PERMANENT,
      };

      expect(getErrorMessage(result)).toContain('download the Excel file');
    });

    it('should return default message for validation errors without message', () => {
      const result = {
        success: false,
        error: ERROR_TYPES.VALIDATION,
      };

      expect(getErrorMessage(result)).toContain('Invalid data');
    });

    it('should return generic message for unknown error types', () => {
      const result = {
        success: false,
        error: 'unknown',
      };

      expect(getErrorMessage(result)).toContain('unexpected error');
    });
  });

  describe('ERROR_TYPES constant', () => {
    it('should export error type constants', () => {
      expect(ERROR_TYPES.TRANSIENT).toBe('transient');
      expect(ERROR_TYPES.PERMANENT).toBe('permanent');
      expect(ERROR_TYPES.VALIDATION).toBe('validation');
    });
  });

  describe('Edge cases', () => {
    beforeEach(() => {
      jest.spyOn(Math, 'random').mockReturnValue(0.9);
    });

    afterEach(() => {
      Math.random.mockRestore();
    });

    it('should handle empty email array', async () => {
      const result = await submitObservation(mockFormData, []);

      expect(result.success).toBe(true);
      expect(result.emailsSent).toBe(0);
    });

    it('should handle large form data', async () => {
      const largeFormData = {
        ...mockFormData,
        observations: Object.fromEntries(
          Array(100)
            .fill(0)
            .map((_, i) => [
              `15:${String(i).padStart(2, '0')}`,
              {
                behavior: 'resting_alert',
                location: '5',
                notes: 'Test',
              },
            ])
        ),
      };

      const result = await submitObservation(largeFormData, mockEmails);

      expect(result.success).toBe(true);
    });

    it('should handle special characters in form data', async () => {
      const specialFormData = {
        ...mockFormData,
        metadata: {
          ...mockFormData.metadata,
          observerName: "O'Brien & Co. <test@example.com>",
        },
        observations: {
          '15:00': {
            behavior: 'resting_alert',
            location: '5',
            notes: 'Special chars: <>&"\'',
          },
        },
      };

      const result = await submitObservation(specialFormData, mockEmails);

      expect(result.success).toBe(true);
    });
  });
});
