/**
 * useSubmission Hook
 *
 * Manages all submission-related state and logic for the observation form.
 * Handles modal states, email validation, API submission, and error handling.
 */

import { useState } from 'react';
import { clearDraft } from '../utils/localStorageUtils';
import {
  submitObservation,
  isRetryableError,
  getErrorMessage,
} from '../services/emailService';
import { validateEmailInput, parseEmailList } from '../utils/validators';
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
    SUBMISSION_STATES.GENERATING
  );
  const [submissionEmail, setSubmissionEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const [isTransientError, setIsTransientError] = useState(false);

  /**
   * Open submission modal and start Excel generation
   */
  const handleOpen = async () => {
    setSubmissionState(SUBMISSION_STATES.GENERATING);
    setShowModal(true);

    // Show loading state briefly
    // In production, actual Excel generation happens on-demand during download
    await new Promise((resolve) => setTimeout(resolve, 500));

    setSubmissionState(SUBMISSION_STATES.READY);
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
   * Submit observation via email
   */
  const handleEmailSubmit = async () => {
    // Validate email before submitting
    const error = validateEmailInput(submissionEmail);
    if (error) {
      setEmailError(error);
      return;
    }

    // Parse email(s) into array
    const { emails } = parseEmailList(submissionEmail);

    // Set submitting state
    setSubmissionState(SUBMISSION_STATES.SUBMITTING);

    // Prepare form data
    const formData = getOutputData();

    try {
      // Submit observation
      const result = await submitObservation(formData, emails);

      if (result.success) {
        // Success
        setSubmissionState(SUBMISSION_STATES.SUCCESS);
        setSubmissionError('');
        setIsTransientError(false);
        clearDraft();
      } else {
        // Error
        setSubmissionState(SUBMISSION_STATES.ERROR);
        setSubmissionError(getErrorMessage(result));
        setIsTransientError(isRetryableError(result));
      }
    } catch (error) {
      // Unexpected error
      setSubmissionState(SUBMISSION_STATES.ERROR);
      setSubmissionError('An unexpected error occurred. Please try again.');
      setIsTransientError(true);
    }
  };

  /**
   * Retry after error
   */
  const handleRetry = () => {
    setSubmissionState(SUBMISSION_STATES.READY);
    setSubmissionError('');
  };

  /**
   * Download Excel file
   */
  const handleDownload = async () => {
    try {
      // Dynamically import Excel generator
      const { downloadExcelFile } = await import(
        '../services/export/excelGenerator'
      );

      // Prepare data
      const data = getOutputData();

      // Sanitize patient name for filename
      const sanitizedPatient = data.metadata.patient.replace(
        /[/\\:*?"<>|]/g,
        '_'
      );
      const filename = `ethogram-${sanitizedPatient}-${data.metadata.date}`;

      // Download
      await downloadExcelFile(data, filename);
    } catch (error) {
      console.error('Failed to generate Excel file:', error);
      alert('Failed to generate Excel file. Please try again.');
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
    setSubmissionState(SUBMISSION_STATES.GENERATING);
    setSubmissionEmail('');
    setEmailError('');
    setSubmissionError('');
    setIsTransientError(false);
  };

  return {
    // State
    showModal,
    submissionState,
    submissionEmail,
    emailError,
    submissionError,
    isTransientError,

    // Actions
    handleOpen,
    handleEmailChange,
    handleEmailSubmit,
    handleRetry,
    handleDownload,
    handleClose,
  };
}
