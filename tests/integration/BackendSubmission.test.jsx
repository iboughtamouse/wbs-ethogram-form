import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import App from '../../src/App';
import * as emailService from '../../src/services/emailService';
import * as localStorageUtils from '../../src/utils/localStorageUtils';
import * as timezoneUtils from '../../src/utils/timezoneUtils';

// Mock utilities
jest.mock('../../src/utils/localStorageUtils');
jest.mock('../../src/utils/timezoneUtils', () => ({
  convertToWBSTime: jest.fn((date, time) => time),
  getUserTimezone: jest.fn(() => 'America/New_York'),
  WBS_TIMEZONE: 'America/Chicago',
}));

// Mock email service
jest.mock('../../src/services/emailService');

// Mock environment variable
const ORIGINAL_ENV = process.env;

describe('Backend Submission Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up env
    process.env = {
      ...ORIGINAL_ENV,
      VITE_WBS_EMAIL: 'test@example.com',
    };

    // Mock localStorage
    localStorageUtils.hasDraft.mockReturnValue(false);
    localStorageUtils.loadDraft.mockReturnValue(null);
    localStorageUtils.saveDraft.mockReturnValue(true);
    localStorageUtils.clearDraft.mockReturnValue(true);
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  /**
   * Helper: Fill out the form with valid data
   */
  const fillValidForm = async () => {
    const user = userEvent.setup();

    // Fill metadata
    const observerInput = screen.getByLabelText(/observer name/i);
    await user.clear(observerInput);
    await user.type(observerInput, 'TestObserver');

    const dateInput = screen.getByLabelText(/observation date/i);
    await user.clear(dateInput);
    await user.type(dateInput, '2025-11-30');

    const startTimeInput = screen.getByLabelText(/start time/i);
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '14:00');

    const endTimeInput = screen.getByLabelText(/end time/i);
    await user.clear(endTimeInput);
    await user.type(endTimeInput, '14:10');

    // Fill first observation (14:00)
    const timeSlots = screen.getAllByTestId(/time-slot-/);
    const firstSlot = timeSlots[0];

    const behaviorSelect = within(firstSlot).getByLabelText(/behavior/i);
    await user.click(behaviorSelect);
    
    // Find and click the "Perching" option
    const perchingOption = await screen.findByText('Perching');
    await user.click(perchingOption);

    const locationInput = within(firstSlot).getByLabelText(/location/i);
    await user.type(locationInput, '12');
  };

  describe('Successful Submission', () => {
    it('submits observation to backend and shows success modal', async () => {
      // Mock successful API response
      emailService.submitObservation.mockResolvedValue({
        success: true,
        id: 'test-observation-id',
        message: 'Observation saved successfully',
      });

      render(<App />);
      await fillValidForm();

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /submit observation/i });
      fireEvent.click(submitButton);

      // Wait for modal to show success state
      await waitFor(() => {
        expect(screen.getByText(/observation saved/i)).toBeInTheDocument();
      });

      // Verify API was called with correct data
      expect(emailService.submitObservation).toHaveBeenCalledTimes(1);
      const callArgs = emailService.submitObservation.mock.calls[0];
      
      // Check observation data structure
      expect(callArgs[0]).toHaveProperty('metadata');
      expect(callArgs[0]).toHaveProperty('observations');
      expect(callArgs[0]).toHaveProperty('submittedAt');
      
      // Check WBS email was included
      expect(callArgs[1]).toEqual(['test@example.com']);
    });

    it('shows download and share options after successful submission', async () => {
      emailService.submitObservation.mockResolvedValue({
        success: true,
        id: 'test-observation-id',
        message: 'Observation saved successfully',
      });

      render(<App />);
      await fillValidForm();

      const submitButton = screen.getByRole('button', { name: /submit observation/i });
      fireEvent.click(submitButton);

      // Wait for success modal
      await waitFor(() => {
        expect(screen.getByText(/observation saved/i)).toBeInTheDocument();
      });

      // Check for download and share buttons
      expect(screen.getByRole('button', { name: /download excel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /share via email/i })).toBeInTheDocument();
    });
  });

  describe('Network Errors', () => {
    it('offers local Excel download when network request fails', async () => {
      // Mock network error (fetch throws)
      emailService.submitObservation.mockRejectedValue(
        new TypeError('Failed to fetch')
      );

      render(<App />);
      await fillValidForm();

      const submitButton = screen.getByRole('button', { name: /submit observation/i });
      fireEvent.click(submitButton);

      // Wait for network error modal
      await waitFor(() => {
        expect(screen.getByText(/couldn't reach server/i)).toBeInTheDocument();
      });

      // Check for local download option
      expect(screen.getByRole('button', { name: /download local copy/i })).toBeInTheDocument();
      
      // Check for retry option
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('shows offline notice when generating local Excel', async () => {
      emailService.submitObservation.mockRejectedValue(
        new TypeError('Failed to fetch')
      );

      render(<App />);
      await fillValidForm();

      const submitButton = screen.getByRole('button', { name: /submit observation/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/not be submitted to WBS/i)).toBeInTheDocument();
      });
    });
  });

  describe('API Errors', () => {
    it('shows error message for validation errors', async () => {
      emailService.submitObservation.mockResolvedValue({
        success: false,
        error: 'validation',
        message: 'Invalid observation data',
        retryable: false,
      });

      render(<App />);
      await fillValidForm();

      const submitButton = screen.getByRole('button', { name: /submit observation/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid observation data/i)).toBeInTheDocument();
      });

      // Should show retry button
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      
      // Should also offer local download as fallback
      expect(screen.getByRole('button', { name: /download local copy/i })).toBeInTheDocument();
    });

    it('shows error message for server errors', async () => {
      emailService.submitObservation.mockResolvedValue({
        success: false,
        error: 'transient',
        message: 'Server error, please try again',
        retryable: true,
      });

      render(<App />);
      await fillValidForm();

      const submitButton = screen.getByRole('button', { name: /submit observation/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('allows retry after transient error', async () => {
      // First call fails, second succeeds
      emailService.submitObservation
        .mockResolvedValueOnce({
          success: false,
          error: 'transient',
          message: 'Server error',
          retryable: true,
        })
        .mockResolvedValueOnce({
          success: true,
          id: 'test-observation-id',
          message: 'Success',
        });

      render(<App />);
      await fillValidForm();

      // First submission
      const submitButton = screen.getByRole('button', { name: /submit observation/i });
      fireEvent.click(submitButton);

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      // Wait for success
      await waitFor(() => {
        expect(screen.getByText(/observation saved/i)).toBeInTheDocument();
      });

      // Verify API was called twice
      expect(emailService.submitObservation).toHaveBeenCalledTimes(2);
    });
  });

  describe('Share Functionality', () => {
    beforeEach(() => {
      // Mock successful submission
      emailService.submitObservation.mockResolvedValue({
        success: true,
        id: 'test-observation-id',
        message: 'Success',
      });
    });

    it('validates email before sharing', async () => {
      const user = userEvent.setup();

      render(<App />);
      await fillValidForm();

      // Submit to get success modal
      const submitButton = screen.getByRole('button', { name: /submit observation/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/observation saved/i)).toBeInTheDocument();
      });

      // Try to share with invalid email
      const shareButton = screen.getByRole('button', { name: /share via email/i });
      fireEvent.click(shareButton);

      // Find email input in modal
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid-email');

      // Try to submit
      const sendButton = screen.getByRole('button', { name: /send/i });
      fireEvent.click(sendButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });

      // shareObservation should NOT have been called
      expect(emailService.shareObservation).not.toHaveBeenCalled();
    });

    it('shares observation to valid email', async () => {
      const user = userEvent.setup();
      
      emailService.shareObservation.mockResolvedValue({
        success: true,
        message: 'Email sent successfully',
      });

      render(<App />);
      await fillValidForm();

      // Submit
      const submitButton = screen.getByRole('button', { name: /submit observation/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/observation saved/i)).toBeInTheDocument();
      });

      // Share
      const shareButton = screen.getByRole('button', { name: /share via email/i });
      fireEvent.click(shareButton);

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'user@example.com');

      const sendButton = screen.getByRole('button', { name: /send/i });
      fireEvent.click(sendButton);

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/email sent successfully/i)).toBeInTheDocument();
      });

      // Verify share was called with correct args
      expect(emailService.shareObservation).toHaveBeenCalledWith(
        'test-observation-id',
        'user@example.com'
      );
    });

    it('handles rate limit error gracefully', async () => {
      const user = userEvent.setup();
      
      emailService.shareObservation.mockResolvedValue({
        success: false,
        error: 'rate_limit',
        message: 'Too many requests. Try again later.',
      });

      render(<App />);
      await fillValidForm();

      // Submit
      const submitButton = screen.getByRole('button', { name: /submit observation/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/observation saved/i)).toBeInTheDocument();
      });

      // Share
      const shareButton = screen.getByRole('button', { name: /share via email/i });
      fireEvent.click(shareButton);

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'user@example.com');

      const sendButton = screen.getByRole('button', { name: /send/i });
      fireEvent.click(sendButton);

      // Should show rate limit message
      await waitFor(() => {
        expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
      });
    });
  });

  describe('Download Functionality', () => {
    it('downloads Excel from backend after successful submission', async () => {
      emailService.submitObservation.mockResolvedValue({
        success: true,
        id: 'test-observation-id',
        message: 'Success',
      });

      // Mock download function
      const mockDownload = jest.fn();
      emailService.downloadFromBackend = mockDownload;

      render(<App />);
      await fillValidForm();

      // Submit
      const submitButton = screen.getByRole('button', { name: /submit observation/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/observation saved/i)).toBeInTheDocument();
      });

      // Click download
      const downloadButton = screen.getByRole('button', { name: /download excel/i });
      fireEvent.click(downloadButton);

      // Should call download with observation ID
      expect(mockDownload).toHaveBeenCalledWith('test-observation-id');
    });
  });
});
