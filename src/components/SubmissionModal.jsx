import { useState } from 'react';
import PropTypes from 'prop-types';
import './SubmissionModal.css';

/**
 * Submission states for the modal
 */
export const SUBMISSION_STATES = {
  GENERATING: 'generating', // Excel generation in progress
  READY: 'ready', // Excel ready, awaiting email input
  SUBMITTING: 'submitting', // Email submission in progress
  SUCCESS: 'success', // Email sent successfully
  ERROR: 'error', // Error occurred
};

/**
 * SubmissionModal - Modal for handling form submission and email delivery
 *
 * Workflow:
 * 1. GENERATING: Excel generation in progress (shows loading)
 * 2. READY: Excel ready, shows email input + download button
 * 3. SUBMITTING: Email submission in progress (shows loading)
 * 4. SUCCESS: Email sent successfully (shows success message)
 * 5. ERROR: Error occurred (shows error + retry/download options)
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {function} props.onClose - Close modal callback
 * @param {string} props.submissionState - Current submission state
 * @param {string} props.errorMessage - Error message to display (if any)
 * @param {boolean} props.isTransientError - Whether error is retryable
 * @param {string} props.email - Email address value
 * @param {string} props.emailError - Email validation error
 * @param {function} props.onEmailChange - Email input change handler
 * @param {function} props.onEmailSubmit - Email submission handler
 * @param {function} props.onDownload - Download Excel handler
 * @param {function} props.onRetry - Retry submission handler
 */
const SubmissionModal = ({
  isOpen,
  onClose,
  submissionState,
  errorMessage = '',
  isTransientError = false,
  email,
  emailError = '',
  onEmailChange,
  onEmailSubmit,
  onDownload,
  onRetry,
}) => {
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    // Only allow closing in certain states
    if (
      e.target === e.currentTarget &&
      submissionState !== SUBMISSION_STATES.GENERATING &&
      submissionState !== SUBMISSION_STATES.SUBMITTING
    ) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    // Only allow ESC closing in certain states
    if (
      e.key === 'Escape' &&
      submissionState !== SUBMISSION_STATES.GENERATING &&
      submissionState !== SUBMISSION_STATES.SUBMITTING
    ) {
      onClose();
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    // Don't submit if there's an email error
    if (emailError) {
      return;
    }

    onEmailSubmit();
  };

  const handleRetry = () => {
    setHasAttemptedSubmit(false);
    onRetry();
  };

  const renderContent = () => {
    switch (submissionState) {
      case SUBMISSION_STATES.GENERATING:
        return (
          <div className="submission-modal-loading">
            <div className="loading-spinner" role="status" aria-live="polite">
              <div className="spinner"></div>
            </div>
            <p className="loading-text">Generating Excel spreadsheet...</p>
          </div>
        );

      case SUBMISSION_STATES.READY:
        return (
          <div className="submission-modal-ready">
            <p className="submission-instructions">
              Your observation data has been prepared. You can download the
              Excel file now, or optionally provide an email address to have it
              sent to you.
            </p>

            <form onSubmit={handleEmailSubmit} className="email-form">
              <div className="form-group">
                <label htmlFor="submission-email" className="email-label">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  id="submission-email"
                  className={`email-input ${emailError && hasAttemptedSubmit ? 'error' : ''}`}
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="your@email.com"
                  aria-describedby={
                    emailError && hasAttemptedSubmit
                      ? 'email-error'
                      : 'email-hint'
                  }
                  aria-invalid={
                    emailError && hasAttemptedSubmit ? 'true' : 'false'
                  }
                />
                {emailError && hasAttemptedSubmit && (
                  <span id="email-error" className="error-message" role="alert">
                    {emailError}
                  </span>
                )}
                {!emailError && (
                  <span id="email-hint" className="input-hint">
                    Leave blank to download only
                  </span>
                )}
              </div>

              <div className="submission-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onDownload}
                >
                  Download Excel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!email.trim()}
                >
                  Send via Email
                </button>
              </div>
            </form>
          </div>
        );

      case SUBMISSION_STATES.SUBMITTING:
        return (
          <div className="submission-modal-loading">
            <div className="loading-spinner" role="status" aria-live="polite">
              <div className="spinner"></div>
            </div>
            <p className="loading-text">Sending email...</p>
          </div>
        );

      case SUBMISSION_STATES.SUCCESS:
        return (
          <div className="submission-modal-success">
            <div className="success-icon" aria-hidden="true">
              ✓
            </div>
            <h3 className="success-title">Email Sent Successfully!</h3>
            <p className="success-message">
              Your observation data has been sent to <strong>{email}</strong>.
              You should receive it shortly.
            </p>
            <p className="success-hint">
              You can also download the file directly:
            </p>
            <div className="submission-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onDownload}
              >
                Download Excel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        );

      case SUBMISSION_STATES.ERROR:
        return (
          <div className="submission-modal-error">
            <div className="error-icon" aria-hidden="true">
              ⚠
            </div>
            <h3 className="error-title">
              {isTransientError ? 'Temporary Issue' : 'Submission Failed'}
            </h3>
            <p className="error-message" role="alert">
              {errorMessage || 'An unexpected error occurred.'}
            </p>

            {isTransientError && (
              <p className="error-hint">
                This appears to be a temporary issue. You can try again or
                download the file directly.
              </p>
            )}

            <div className="submission-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onDownload}
              >
                Download Anyway
              </button>
              {isTransientError && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleRetry}
                >
                  Try Again
                </button>
              )}
              {!isTransientError && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onClose}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (submissionState) {
      case SUBMISSION_STATES.GENERATING:
        return 'Generating Spreadsheet';
      case SUBMISSION_STATES.READY:
        return 'Submit Observation Data';
      case SUBMISSION_STATES.SUBMITTING:
        return 'Sending Email';
      case SUBMISSION_STATES.SUCCESS:
        return 'Success';
      case SUBMISSION_STATES.ERROR:
        return 'Error';
      default:
        return 'Submit';
    }
  };

  const showCloseButton =
    submissionState !== SUBMISSION_STATES.GENERATING &&
    submissionState !== SUBMISSION_STATES.SUBMITTING;

  return (
    <div
      className="submission-modal-backdrop"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="submission-modal-title"
    >
      <div className="submission-modal">
        <div className="submission-modal-header">
          <h2 id="submission-modal-title">{getModalTitle()}</h2>
          {showCloseButton && (
            <button
              className="submission-modal-close"
              onClick={onClose}
              aria-label="Close submission modal"
            >
              ×
            </button>
          )}
        </div>

        <div className="submission-modal-content">{renderContent()}</div>
      </div>
    </div>
  );
};

SubmissionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  submissionState: PropTypes.oneOf(Object.values(SUBMISSION_STATES)).isRequired,
  errorMessage: PropTypes.string,
  isTransientError: PropTypes.bool,
  email: PropTypes.string.isRequired,
  emailError: PropTypes.string,
  onEmailChange: PropTypes.func.isRequired,
  onEmailSubmit: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onRetry: PropTypes.func.isRequired,
};

export default SubmissionModal;
