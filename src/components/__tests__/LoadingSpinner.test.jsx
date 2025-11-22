import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('Rendering', () => {
    test('renders spinner element', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    test('renders with default loading message', () => {
      render(<LoadingSpinner />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('renders with custom message', () => {
      render(<LoadingSpinner message="Generating Excel file..." />);
      expect(screen.getByText('Generating Excel file...')).toBeInTheDocument();
    });

    test('renders spinner animation element', () => {
      const { container } = render(<LoadingSpinner />);
      const spinnerAnimation = container.querySelector('.loading-spinner');
      expect(spinnerAnimation).toBeInTheDocument();
    });
  });

  describe('Accessibility - ARIA Attributes', () => {
    test('has role="status" for screen reader announcements', () => {
      render(<LoadingSpinner message="Processing..." />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    test('has aria-live="polite" for non-intrusive announcements', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-live', 'polite');
    });

    test('has aria-busy="true" to indicate loading state', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-busy', 'true');
    });

    test('has aria-label with descriptive text', () => {
      render(<LoadingSpinner message="Downloading file..." />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Downloading file...');
    });

    test('uses message prop for aria-label', () => {
      const customMessage = 'Custom loading message';
      render(<LoadingSpinner message={customMessage} />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', customMessage);
    });

    test('is visible in accessibility tree', () => {
      render(<LoadingSpinner message="Loading..." />);
      const spinner = screen.getByRole('status');
      // Should not have aria-hidden
      expect(spinner).not.toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Accessibility - Screen Reader Support', () => {
    test('message is readable by screen readers', () => {
      render(<LoadingSpinner message="Please wait..." />);
      // Text should be in the document and accessible
      const message = screen.getByText('Please wait...');
      expect(message).toBeInTheDocument();
      expect(message).toBeVisible();
    });

    test('spinner has no conflicting roles', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      // Should only have status role, not multiple conflicting roles
      const roles = spinner.getAttribute('role');
      expect(roles).toBe('status');
    });
  });

  describe('Visual Presentation', () => {
    test('applies loading-spinner-container class', () => {
      const { container } = render(<LoadingSpinner />);
      const containerElement = container.firstChild;
      expect(containerElement).toHaveClass('loading-spinner-container');
    });

    test('spinner animation has proper class for styling', () => {
      const { container } = render(<LoadingSpinner />);
      const spinnerAnimation = container.querySelector('.loading-spinner');
      expect(spinnerAnimation).toBeInTheDocument();
    });

    test('message has proper class for styling', () => {
      const { container } = render(<LoadingSpinner />);
      const message = container.querySelector('.loading-message');
      expect(message).toBeInTheDocument();
    });
  });

  describe('Component Props', () => {
    test('message prop defaults to "Loading..."', () => {
      render(<LoadingSpinner />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('accepts and displays custom className', () => {
      const { container } = render(
        <LoadingSpinner className="custom-spinner" />
      );
      const spinner = container.firstChild;
      expect(spinner).toHaveClass('loading-spinner-container');
      expect(spinner).toHaveClass('custom-spinner');
    });

    test('size prop affects spinner class (if implemented)', () => {
      const { container } = render(<LoadingSpinner size="large" />);
      const spinnerElement = container.querySelector('.loading-spinner');
      expect(spinnerElement).toHaveClass('loading-spinner-large');
    });

    test('size prop defaults to medium', () => {
      const { container } = render(<LoadingSpinner />);
      const spinnerElement = container.querySelector('.loading-spinner');
      expect(spinnerElement).toHaveClass('loading-spinner-medium');
    });
  });
});
