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

  describe('submitObservation - Real API', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return success response from API', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            submissionId: 'uuid-123',
            message: 'Observation submitted successfully',
            emailsSent: 1,
          }),
      });

      const result = await submitObservation(mockFormData, mockEmails);

      expect(result.success).toBe(true);
      expect(result.submissionId).toBe('uuid-123');
      expect(result.message).toBe('Observation submitted successfully');
      expect(result.emailsSent).toBe(1);
    });

    it('should call API with correct payload', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            submissionId: 'uuid-123',
            message: 'Success',
            emailsSent: 1,
          }),
      });

      await submitObservation(mockFormData, mockEmails);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/observations/submit',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            observation: mockFormData,
            emails: mockEmails,
          }),
        }
      );
    });

    it('should handle validation errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Validation failed',
              details: [{ field: 'observerName', message: 'Required' }],
            },
          }),
      });

      const result = await submitObservation(mockFormData, mockEmails);

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_TYPES.VALIDATION);
      expect(result.status).toBe(400);
      expect(result.message).toBe('Validation failed');
      expect(result.details).toEqual([
        { field: 'observerName', message: 'Required' },
      ]);
    });

    it('should handle server errors as transient', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () =>
          Promise.resolve({
            success: false,
            error: {
              code: 'DATABASE_ERROR',
              message: 'Database connection failed',
            },
          }),
      });

      const result = await submitObservation(mockFormData, mockEmails);

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_TYPES.TRANSIENT);
      expect(result.status).toBe(500);
      expect(result.retryable).toBe(true);
    });

    it('should handle rate limiting as transient', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () =>
          Promise.resolve({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many requests',
            },
          }),
      });

      const result = await submitObservation(mockFormData, mockEmails);

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_TYPES.TRANSIENT);
      expect(result.status).toBe(429);
      expect(result.retryable).toBe(true);
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await submitObservation(mockFormData, mockEmails);

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_TYPES.TRANSIENT);
      expect(result.message).toBe('Network error');
      expect(result.status).toBeNull();
      expect(result.retryable).toBe(true);
    });

    it('should handle 4xx errors as permanent', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () =>
          Promise.resolve({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Access denied',
            },
          }),
      });

      const result = await submitObservation(mockFormData, mockEmails);

      expect(result.success).toBe(false);
      expect(result.error).toBe(ERROR_TYPES.PERMANENT);
      expect(result.status).toBe(403);
      expect(result.retryable).toBe(false);
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
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should handle empty email array', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            submissionId: 'uuid-123',
            message: 'Success',
            emailsSent: 0,
          }),
      });

      const result = await submitObservation(mockFormData, []);

      expect(result.success).toBe(true);
      expect(result.emailsSent).toBe(0);
    });

    it('should handle large form data', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            submissionId: 'uuid-123',
            message: 'Success',
            emailsSent: 1,
          }),
      });

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
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            submissionId: 'uuid-123',
            message: 'Success',
            emailsSent: 1,
          }),
      });

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
