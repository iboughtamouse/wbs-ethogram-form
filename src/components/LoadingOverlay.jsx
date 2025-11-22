import { useEffect } from 'react';
import PropTypes from 'prop-types';
import LoadingSpinner from './LoadingSpinner';
import './LoadingOverlay.css';

/**
 * LoadingOverlay Component
 *
 * A full-screen, modal overlay that blocks user interaction during async operations.
 * Designed for operations that could take time (e.g., Excel generation on slow connections).
 *
 * Features:
 * - Prevents accidental user interaction while loading
 * - Blocks body scroll
 * - Full accessibility support with ARIA attributes
 * - Screen reader announcements
 * - Visual loading feedback with spinner
 *
 * Accessibility Features:
 * - role="status" for screen reader announcements
 * - aria-live="assertive" for important, immediate announcements
 * - aria-busy="true" to indicate loading state
 * - aria-modal="true" to indicate modal behavior
 * - Prevents focus from leaving overlay
 * - Restores body scroll on unmount
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isVisible - Whether the overlay is visible
 * @param {string} props.message - Loading message to display (default: "Loading...")
 */
const LoadingOverlay = ({ isVisible = false, message = 'Loading...' }) => {
  // Manage body scroll - prevent scrolling when overlay is visible
  useEffect(() => {
    if (isVisible) {
      // Store original overflow value
      const originalOverflow = document.body.style.overflow;

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Cleanup: restore original overflow when overlay is hidden or unmounted
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isVisible]);

  // Don't render anything if not visible
  if (!isVisible) {
    return null;
  }

  // Prevent click events from propagating to background elements
  const handleBackdropClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className="loading-overlay-backdrop"
      onClick={handleBackdropClick}
      role="status"
      aria-live="assertive"
      aria-busy="true"
      aria-modal="true"
      aria-label={message}
    >
      <div className="loading-overlay-content">
        <LoadingSpinner
          message={message}
          size="large"
          presentationOnly={true}
        />
      </div>
    </div>
  );
};

LoadingOverlay.propTypes = {
  isVisible: PropTypes.bool,
  message: PropTypes.string,
};

export default LoadingOverlay;
