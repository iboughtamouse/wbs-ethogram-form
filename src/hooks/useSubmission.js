/**
 * useSubmission Hook
 *
 * Manages all submission-related state and logic for the observation form.
 * Handles backend submission, modal states, download/share actions, and error handling.
 *
 * Flow: Submit → Backend API → Success (show download/share) or Error (retry/fallback)
 */

import { useState } from 'react';
import { clearDraft } from '../utils/localStorageUtils';
import {
  submitObservation,
  shareObservation,
  isRetryableError,
  isNetworkError,
  getErrorMessage,
} from '../services/emailService';
import {
  downloadFromBackend,
  downloadLocally,
} from '../services/downloadService';
import { validateEmailInput, parseEmailList } from '../utils/validators';
import { getWBSEmail } from '../utils/envConfig';
import { SUBMISSION_STATES } from '../components/SubmissionModal';

/**
 * Hook for managing observation submission flow
 *
 * @param {Function} getOutputData - Function that returns prepared form data
 * @param {Function} resetForm - Function to reset the form after successful submission
 * @param {Function} clearAllErrors - Function to clear all validation errors
 * @returns {Object} Submission state and handlers
 */
export function useSubmission(getOutputData, resetForm, clearAllErrors) {
  // Modal and submission state
  const [showModal, setShowModal] = useState(false);
  const [submissionState, setSubmissionState] = useState(
    SUBMISSION_STATES.SUBMITTING
  );
  const [observationId, setObservationId] = useState(null);
  const [submissionEmail, setSubmissionEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const [isTransientError, setIsTransientError] = useState(false);

  /**
   * Open submission modal and submit to backend immediately
   * New flow: Submit first, then offer download/share options
   */
  const handleOpen = async () => {
    setSubmissionState(SUBMISSION_STATES.SUBMITTING);
    setShowModal(true);

    // Get WBS email from environment
    const wbsEmail = getWBSEmail();
    if (!wbsEmail) {
      console.error('VITE_WBS_EMAIL not configured');
      setSubmissionState(SUBMISSION_STATES.ERROR);
      setSubmissionError(
        'Configuration error: WBS email not set. Please contact support.'
      );
      setIsTransientError(false);
      return;
    }

    // Prepare form data
    const formData = getOutputData();

    try {
      // Submit to backend
      const result = await submitObservation(formData, [wbsEmail]);

      if (result.success) {
        // Success! Store ID and show success state with download/share options
        setObservationId(result.submissionId);
        setSubmissionState(SUBMISSION_STATES.SUCCESS);
        setSubmissionError('');
        setIsTransientError(false);
        clearDraft();
      } else {
        // API error - check if it's a network issue for local fallback
        if (isNetworkError(result)) {
          // Network error - offer local Excel generation
          setSubmissionState(SUBMISSION_STATES.ERROR);
          setSubmissionError(
            'Unable to reach server. You can download a local copy of your observation.'
          );
          setIsTransientError(true);
        } else {
          // Other API error
          setSubmissionState(SUBMISSION_STATES.ERROR);
          setSubmissionError(getErrorMessage(result));
          setIsTransientError(isRetryableError(result));
        }
      }
    } catch (error) {
      // Unexpected error - treat as network issue
      console.error('Submission error:', error);
      setSubmissionState(SUBMISSION_STATES.ERROR);
      setSubmissionError(
        'Unable to reach server. You can download a local copy of your observation.'
      );
      setIsTransientError(true);
    }
  };

  /**
   * Handle email input change with validation
   */
  const handleEmailChange = (value) => {
    setSubmissionEmail(value);
    const error = validateEmailInput(value);
    setEmailError(error);
  };

  /**
   * Share observation via email (after successful submission)
   * Only available when observationId exists
   */
  const handleShare = async () => {
    // Validate email before sharing
    const error = validateEmailInput(submissionEmail);
    if (error) {
      setEmailError(error);
      return;
    }

    // Must have observationId to share
    if (!observationId) {
      setEmailError('Cannot share: observation not submitted to server');
      return;
    }

    // Parse email(s) into array
    const { emails } = parseEmailList(submissionEmail);

    if (emails.length === 0) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Clear any previous errors
    setEmailError('');
    setSubmissionError('');

    try {
      // Share via backend (supports multiple emails)
      const result = await shareObservation(observationId, emails);

      if (result.success) {
        // Success - show feedback
        alert(`Successfully shared with ${emails.join(', ')}`);
        setSubmissionEmail(''); // Clear email field
      } else {
        // Error (could be rate limit or other issue)
        setEmailError(result.message || 'Failed to share observation');
      }
    } catch (error) {
      console.error('Share failed:', error);
      setEmailError('Failed to share observation. Please try again.');
    }
  };

  /**
   * Retry submission after error
   */
  const handleRetry = () => {
    // Clear errors and retry submission
    setSubmissionError('');
    setEmailError('');
    handleOpen();
  };

  /**
   * Download Excel file
   * If we have observationId, download from backend
   * Otherwise, generate locally (offline mode)
   */
  const handleDownload = async () => {
    try {
      if (observationId) {
        // Download from backend
        await downloadFromBackend(observationId);
      } else {
        // Generate locally (fallback/offline mode)
        const formData = getOutputData();
        await downloadLocally(formData, true); // true = mark as offline
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download Excel file. Please try again.');
    }
  };

  /**
   * Close modal and reset state
   */
  const handleClose = () => {
    // If closing after success, reset form
    if (submissionState === SUBMISSION_STATES.SUCCESS) {
      resetForm();
      clearAllErrors();
    }

    // Reset modal state
    setShowModal(false);
    setSubmissionState(SUBMISSION_STATES.SUBMITTING);
    setObservationId(null);
    setSubmissionEmail('');
    setEmailError('');
    setSubmissionError('');
    setIsTransientError(false);
  };

  return {
    // State
    showModal,
    submissionState,
    observationId,
    submissionEmail,
    emailError,
    submissionError,
    isTransientError,

    // Actions
    handleOpen,
    handleEmailChange,
    handleShare,
    handleRetry,
    handleDownload,
    handleClose,
  };
}
