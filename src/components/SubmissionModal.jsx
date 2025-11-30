import PropTypes from 'prop-types';
import './SubmissionModal.css';

/**
 * Submission states for the modal
 */
export const SUBMISSION_STATES = {
  SUBMITTING: 'submitting', // Backend submission in progress
  SUCCESS: 'success', // Successfully submitted to backend
  ERROR: 'error', // Error occurred during submission
};

/**
 * SubmissionModal - Modal for handling backend submission with download/share options
 *
 * New Workflow (Backend Integration):
 * 1. SUBMITTING: Backend submission in progress (shows loading)
 * 2. SUCCESS: Successfully saved to backend (shows download/share options)
 * 3. ERROR: Submission failed (shows error + retry or local download fallback)
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {function} props.onClose - Close modal callback
 * @param {string} props.submissionState - Current submission state
 * @param {string} props.errorMessage - Error message to display (if any)
 * @param {boolean} props.isTransientError - Whether error is retryable
 * @param {string} props.email - Email address value (for share function)
 * @param {string} props.emailError - Email validation error
 * @param {string} props.shareSuccessMessage - Success message for share action
 * @param {function} props.onEmailChange - Email input change handler
 * @param {function} props.onEmailSubmit - Share via email handler
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
  shareSuccessMessage = '',
  onEmailChange,
  onEmailSubmit,
  onDownload,
  onRetry,
}) => {
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

  const renderContent = () => {
    switch (submissionState) {
      case SUBMISSION_STATES.SUBMITTING:
        return (
          <div className="submission-modal-loading">
            <div className="loading-spinner" role="status" aria-live="polite">
              <div className="spinner"></div>
            </div>
            <p className="loading-text">Submitting observation...</p>
          </div>
        );

      case SUBMISSION_STATES.SUCCESS:
        return (
          <div className="submission-modal-success">
            <div className="success-icon" aria-hidden="true">
              ✓
            </div>
            <h3 className="success-title">Observation Submitted!</h3>
            <p className="success-message">
              Your observation has been successfully saved and sent to WBS for
              review.
            </p>
            <p className="success-hint">
              Download a copy or share it with others:
            </p>
            <div className="submission-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={onDownload}
              >
                Download Excel
              </button>
            </div>

            {/* Share via email section */}
            <div className="share-section">
              <hr className="divider" />
              <h4 className="share-title">Share via Email</h4>
              <p className="share-hint">
                Send a copy to yourself or others (optional)
              </p>
              <div className="email-input-group">
                <input
                  type="text"
                  inputMode="email"
                  className={`email-input ${emailError ? 'has-error' : ''}`}
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  aria-label="Email address"
                  aria-invalid={emailError ? 'true' : 'false'}
                  aria-describedby={emailError ? 'email-error' : undefined}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onEmailSubmit}
                  disabled={!email || !!emailError}
                >
                  Share
                </button>
              </div>
              {emailError && (
                <p className="error-message" id="email-error" role="alert">
                  {emailError}
                </p>
              )}
              {shareSuccessMessage && (
                <p className="success-message" role="status">
                  ✓ {shareSuccessMessage}
                </p>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-tertiary"
                onClick={onClose}
              >
                Done
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
                  onClick={onRetry}
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
      case SUBMISSION_STATES.SUBMITTING:
        return 'Submitting Observation';
      case SUBMISSION_STATES.SUCCESS:
        return 'Success!';
      case SUBMISSION_STATES.ERROR:
        return 'Error';
      default:
        return 'Submit';
    }
  };

  const showCloseButton = submissionState !== SUBMISSION_STATES.SUBMITTING;

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
  shareSuccessMessage: PropTypes.string,
  onEmailChange: PropTypes.func.isRequired,
  onEmailSubmit: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onRetry: PropTypes.func.isRequired,
};

export default SubmissionModal;
