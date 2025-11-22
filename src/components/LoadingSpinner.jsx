import PropTypes from 'prop-types';
import './LoadingSpinner.css';

/**
 * LoadingSpinner Component
 *
 * A fully accessible loading spinner with ARIA attributes and screen reader support.
 * Designed to provide visual and non-visual feedback during async operations.
 *
 * Accessibility Features:
 * - role="status" for screen reader announcements (when standalone)
 * - aria-live="polite" for non-intrusive updates (when standalone)
 * - aria-busy="true" to indicate loading state (when standalone)
 * - aria-label for descriptive context (when standalone)
 * - Visible and readable message text
 * - Can be used in presentation mode when inside another status container
 *
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message to display (default: "Loading...")
 * @param {string} props.size - Spinner size: "small", "medium", "large" (default: "medium")
 * @param {string} props.className - Additional CSS classes to apply
 * @param {boolean} props.presentationOnly - If true, removes ARIA status attributes (for use inside other status containers)
 */
const LoadingSpinner = ({
  message = 'Loading...',
  size = 'medium',
  className = '',
  presentationOnly = false,
}) => {
  // Combine class names
  const containerClass = `loading-spinner-container ${className}`.trim();
  const spinnerClass = `loading-spinner loading-spinner-${size}`;

  // Build ARIA props - only include status role and attributes when not in presentation mode
  const ariaProps = presentationOnly
    ? {}
    : {
        role: 'status',
        'aria-live': 'polite',
        'aria-busy': 'true',
        'aria-label': message,
      };

  return (
    <div className={containerClass} {...ariaProps}>
      {/* Visual spinner animation */}
      <div className={spinnerClass} aria-hidden="true">
        <div className="spinner-circle"></div>
      </div>

      {/* Loading message - visible to both sighted users and screen readers */}
      <div className="loading-message">{message}</div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  presentationOnly: PropTypes.bool,
};

export default LoadingSpinner;
