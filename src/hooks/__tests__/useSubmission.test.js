/**
 * Unit tests for useSubmission hook
 *
 * Tests state management, API interactions, error handling, and user actions
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSubmission } from '../useSubmission';
import * as emailService from '../../services/emailService';
import * as downloadService from '../../services/downloadService';
import * as localStorageUtils from '../../utils/localStorageUtils';
import { SUBMISSION_STATES } from '../../components/SubmissionModal';

// Mock all dependencies
jest.mock('../../services/emailService');
jest.mock('../../services/downloadService');
jest.mock('../../utils/localStorageUtils');

describe('useSubmission', () => {
  // Mock functions
  const mockGetOutputData = jest.fn();
  const mockResetForm = jest.fn();
  const mockClearAllErrors = jest.fn();

  // Sample form data
  const sampleFormData = {
    metadata: {
      observerName: 'Test Observer',
      date: '2025-11-30',
      startTime: '15:00',
      endTime: '15:30',
      aviary: "Sayyida's Cove",
      patient: 'Sayyida',
      mode: 'live',
    },
    observations: {
      '15:00': { behavior: 'perching', location: '5', notes: '' },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetOutputData.mockReturnValue(sampleFormData);

    // Default successful mock responses
    emailService.submitObservation.mockResolvedValue({
      success: true,
      submissionId: 'test-id-123',
      message: 'Success',
      emailsSent: 1,
    });

    emailService.shareObservation.mockResolvedValue({
      success: true,
      emailsSent: 2,
    });

    emailService.isRetryableError.mockReturnValue(false);
    emailService.isNetworkError.mockReturnValue(false);
    emailService.getErrorMessage.mockReturnValue('Generic error');

    downloadService.downloadFromBackend.mockResolvedValue();
    downloadService.downloadLocally.mockResolvedValue();

    localStorageUtils.clearDraft.mockReturnValue(true);
  });

  describe('Initial state', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() =>
        useSubmission(mockGetOutputData, mockResetForm, mockClearAllErrors)
      );

      expect(result.current.showModal).toBe(false);
      expect(result.current.submissionState).toBe(SUBMISSION_STATES.SUBMITTING);
      expect(result.current.submissionEmail).toBe('');
      expect(result.current.emailError).toBe('');
      expect(result.current.submissionError).toBe('');
      expect(result.current.isTransientError).toBe(false);
      expect(result.current.observationId).toBe(null);
      expect(result.current.shareSuccessMessage).toBe('');
    });
  });

  describe('handleOpen - Backend submission', () => {
    // Suppress console.error for tests that intentionally trigger errors
    let consoleErrorSpy;

    beforeEach(() => {
      consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should successfully submit to backend and show modal', async () => {
      const { result } = renderHook(() =>
        useSubmission(mockGetOutputData, mockResetForm, mockClearAllErrors)
      );

      await act(async () => {
        await result.current.handleOpen();
      });

      await waitFor(() => {
        expect(result.current.showModal).toBe(true);
        expect(result.current.submissionState).toBe(SUBMISSION_STATES.SUCCESS);
        expect(result.current.observationId).toBe('test-id-123');
      });

      expect(emailService.submitObservation).toHaveBeenCalledWith(
        sampleFormData,
        ['test-wbs@example.com'] // from jest.setup.js mock
      );
      expect(localStorageUtils.clearDraft).toHaveBeenCalled();

      // resetForm and clearAllErrors are NOT called on submission
      // They're only called in handleClose() after success
      expect(mockResetForm).not.toHaveBeenCalled();
      expect(mockClearAllErrors).not.toHaveBeenCalled();
    });

    it('should handle network errors and set transient error flag', async () => {
      emailService.submitObservation.mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() =>
        useSubmission(mockGetOutputData, mockResetForm, mockClearAllErrors)
      );

      await act(async () => {
        await result.current.handleOpen();
      });

      await waitFor(() => {
        expect(result.current.submissionState).toBe(SUBMISSION_STATES.ERROR);
        expect(result.current.isTransientError).toBe(true);
        expect(result.current.submissionError).toContain(
          'Unable to reach server'
        );
      });
    });

    it('should handle API validation errors', async () => {
      const apiError = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid data',
      };

      emailService.submitObservation.mockResolvedValueOnce({
        success: false,
        error: apiError,
      });
      emailService.isRetryableError.mockReturnValue(false);
      emailService.getErrorMessage.mockReturnValue('Invalid data');

      const { result } = renderHook(() =>
        useSubmission(mockGetOutputData, mockResetForm, mockClearAllErrors)
      );

      await act(async () => {
        await result.current.handleOpen();
      });

      await waitFor(() => {
        expect(result.current.submissionState).toBe(SUBMISSION_STATES.ERROR);
        expect(result.current.submissionError).toBe('Invalid data');
        expect(result.current.isTransientError).toBe(false);
      });
    });

    it('should handle retryable errors', async () => {
      emailService.submitObservation.mockResolvedValueOnce({
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Too many requests' },
      });
      emailService.isRetryableError.mockReturnValue(true);
      emailService.getErrorMessage.mockReturnValue('Too many requests');

      const { result } = renderHook(() =>
        useSubmission(mockGetOutputData, mockResetForm, mockClearAllErrors)
      );

      await act(async () => {
        await result.current.handleOpen();
      });

      await waitFor(() => {
        expect(result.current.submissionState).toBe(SUBMISSION_STATES.ERROR);
        expect(result.current.isTransientError).toBe(true);
      });
    });
  });

  describe('handleShare - Email sharing', () => {
    it('should validate email before sharing', async () => {
      const { result } = renderHook(() =>
        useSubmission(mockGetOutputData, mockResetForm, mockClearAllErrors)
      );

      // Set up successful submission first
      await act(async () => {
        await result.current.handleOpen();
      });

      // Try to share with invalid email
      act(() => {
        result.current.handleEmailChange('invalid-email');
      });

      await act(async () => {
        await result.current.handleShare();
      });

      expect(result.current.emailError).toBeTruthy();
      expect(emailService.shareObservation).not.toHaveBeenCalled();
    });

    it('should successfully share observation via email', async () => {
      const { result } = renderHook(() =>
        useSubmission(mockGetOutputData, mockResetForm, mockClearAllErrors)
      );

      // Submit first to get observationId
      await act(async () => {
        await result.current.handleOpen();
      });

      // Share with valid email
      act(() => {
        result.current.handleEmailChange('test@example.com');
      });

      await act(async () => {
        await result.current.handleShare();
      });

      await waitFor(() => {
        expect(emailService.shareObservation).toHaveBeenCalledWith(
          'test-id-123',
          ['test@example.com']
        );
        expect(result.current.shareSuccessMessage).toBe(
          'Successfully shared with test@example.com'
        );
      });
    });

    it('should handle multiple emails', async () => {
      const { result } = renderHook(() =>
        useSubmission(mockGetOutputData, mockResetForm, mockClearAllErrors)
      );

      await act(async () => {
        await result.current.handleOpen();
      });

      act(() => {
        result.current.handleEmailChange(
          'test1@example.com, test2@example.com'
        );
      });

      await act(async () => {
        await result.current.handleShare();
      });

      await waitFor(() => {
        expect(emailService.shareObservation).toHaveBeenCalledWith(
          'test-id-123',
          ['test1@example.com', 'test2@example.com']
        );
      });
    });

    it('should handle share failures', async () => {
      emailService.shareObservation.mockResolvedValueOnce({
        success: false,
        message: 'Email service unavailable',
      });

      const { result } = renderHook(() =>
        useSubmission(mockGetOutputData, mockResetForm, mockClearAllErrors)
      );

      await act(async () => {
        await result.current.handleOpen();
      });

      act(() => {
        result.current.handleEmailChange('test@example.com');
      });

      await act(async () => {
        await result.current.handleShare();
      });

      await waitFor(() => {
        // The hook uses result.message or falls back to 'Failed to share observation'
        expect(result.current.emailError).toBe('Email service unavailable');
      });
    });

    it('should prevent sharing without observationId', async () => {
      const { result } = renderHook(() =>
        useSubmission(mockGetOutputData, mockResetForm, mockClearAllErrors)
      );

      act(() => {
        result.current.handleEmailChange('test@example.com');
      });

      await act(async () => {
        await result.current.handleShare();
      });

      expect(emailService.shareObservation).not.toHaveBeenCalled();
      expect(result.current.emailError).toContain('observation not submitted');
    });
  });

  describe('handleDownload - Excel download', () => {
    // Suppress console.error for tests that intentionally trigger download errors
    let consoleErrorSpy;

    beforeEach(() => {
      consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should download from backend when observationId exists', async () => {
      const { result } = renderHook(() =>
        useSubmission(mockGetOutputData, mockResetForm, mockClearAllErrors)
      );

      // Submit first
      await act(async () => {
        await result.current.handleOpen();
      });

      // Download
      await act(async () => {
        await result.current.handleDownload();
      });

      expect(downloadService.downloadFromBackend).toHaveBeenCalledWith(
        'test-id-123'
      );
      expect(downloadService.downloadLocally).not.toHaveBeenCalled();
    });

    it('should show error if backend download fails', async () => {
      downloadService.downloadFromBackend.mockRejectedValueOnce(
        new Error('Backend unavailable')
      );

      const { result } = renderHook(() =>
        useSubmission(mockGetOutputData, mockResetForm, mockClearAllErrors)
      );

      await act(async () => {
        await result.current.handleOpen();
      });

      await act(async () => {
        await result.current.handleDownload();
      });

      await waitFor(() => {
        expect(downloadService.downloadFromBackend).toHaveBeenCalled();
        // Does NOT fallback - just shows error
        expect(downloadService.downloadLocally).not.toHaveBeenCalled();
        expect(result.current.submissionError).toBe(
          'Failed to download Excel file. Please try again.'
        );
      });
    });

    it('should use local download when no observationId', async () => {
      // Simulate error state where submission failed
      emailService.submitObservation.mockResolvedValueOnce({
        success: false,
        error: { message: 'Server error' },
      });

      const { result } = renderHook(() =>
        useSubmission(mockGetOutputData, mockResetForm, mockClearAllErrors)
      );

      await act(async () => {
        await result.current.handleOpen();
      });

      await act(async () => {
        await result.current.handleDownload();
      });

      expect(downloadService.downloadFromBackend).not.toHaveBeenCalled();
      expect(downloadService.downloadLocally).toHaveBeenCalledWith(
        sampleFormData,
        true // offline flag is true when no observationId
      );
    });

    it('should handle download errors gracefully', async () => {
      downloadService.downloadLocally.mockRejectedValueOnce(
        new Error('Download failed')
      );

      const { result } = renderHook(() =>
        useSubmission(mockGetOutputData, mockResetForm, mockClearAllErrors)
      );

      // Simulate error state (no observationId) to test local download path
      emailService.submitObservation.mockResolvedValueOnce({
        success: false,
        error: { message: 'Server error' },
      });

      await act(async () => {
        await result.current.handleOpen();
      });

      await act(async () => {
        await result.current.handleDownload();
      });

      await waitFor(() => {
        expect(result.current.submissionError).toBe(
          'Failed to download Excel file. Please try again.'
        );
      });
    });
  });

  describe('handleRetry - Retry submission', () => {
    it('should retry submission after error', async () => {
      emailService.submitObservation
        .mockResolvedValueOnce({
          success: false,
          error: { message: 'Temporary error' },
        })
        .mockResolvedValueOnce({
          success: true,
          submissionId: 'retry-id-456',
          message: 'Success',
          emailsSent: 1,
        });

      const { result } = renderHook(() =>
        useSubmission(mockGetOutputData, mockResetForm, mockClearAllErrors)
      );

      // First attempt fails
      await act(async () => {
        await result.current.handleOpen();
      });

      await waitFor(() => {
        expect(result.current.submissionState).toBe(SUBMISSION_STATES.ERROR);
      });

      // Retry succeeds
      await act(async () => {
        await result.current.handleRetry();
      });

      await waitFor(() => {
        expect(result.current.submissionState).toBe(SUBMISSION_STATES.SUCCESS);
        expect(result.current.observationId).toBe('retry-id-456');
      });
    });
  });

  describe('handleClose - Modal closure', () => {
    it('should close modal and reset state', () => {
      const { result } = renderHook(() =>
        useSubmission(mockGetOutputData, mockResetForm, mockClearAllErrors)
      );

      act(() => {
        result.current.handleClose();
      });

      expect(result.current.showModal).toBe(false);
      expect(result.current.submissionError).toBe('');
      expect(result.current.emailError).toBe('');
      expect(result.current.shareSuccessMessage).toBe('');
    });
  });

  describe('handleEmailChange - Email validation', () => {
    it('should update email and clear errors for valid email', () => {
      const { result } = renderHook(() =>
        useSubmission(mockGetOutputData, mockResetForm, mockClearAllErrors)
      );

      act(() => {
        result.current.handleEmailChange('valid@example.com');
      });

      expect(result.current.submissionEmail).toBe('valid@example.com');
      expect(result.current.emailError).toBe('');
    });

    it('should show error for invalid email', () => {
      const { result } = renderHook(() =>
        useSubmission(mockGetOutputData, mockResetForm, mockClearAllErrors)
      );

      act(() => {
        result.current.handleEmailChange('invalid-email');
      });

      expect(result.current.submissionEmail).toBe('invalid-email');
      expect(result.current.emailError).toBeTruthy();
    });
  });

  describe('Cleanup', () => {
    it('should clear timeout on unmount', () => {
      jest.useFakeTimers();

      const { result, unmount } = renderHook(() =>
        useSubmission(mockGetOutputData, mockResetForm, mockClearAllErrors)
      );

      // Trigger share success which sets timeout
      act(() => {
        result.current.handleOpen();
      });

      // Unmount before timeout fires
      unmount();

      // Advance timers - should not cause errors
      jest.runAllTimers();

      jest.useRealTimers();
    });
  });
});
