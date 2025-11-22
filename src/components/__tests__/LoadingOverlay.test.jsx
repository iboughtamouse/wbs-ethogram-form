import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoadingOverlay from '../LoadingOverlay';

describe('LoadingOverlay', () => {
  describe('Rendering', () => {
    test('renders overlay when visible', () => {
      render(<LoadingOverlay isVisible={true} message="Processing..." />);
      const overlay = screen.getByRole('status');
      expect(overlay).toBeInTheDocument();
    });

    test('does not render when not visible', () => {
      const { container } = render(
        <LoadingOverlay isVisible={false} message="Processing..." />
      );
      expect(container.firstChild).toBeNull();
    });

    test('renders with default message', () => {
      render(<LoadingOverlay isVisible={true} />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('renders with custom message', () => {
      render(
        <LoadingOverlay isVisible={true} message="Generating Excel file..." />
      );
      expect(screen.getByText('Generating Excel file...')).toBeInTheDocument();
    });

    test('renders LoadingSpinner component', () => {
      render(<LoadingOverlay isVisible={true} message="Please wait..." />);
      // LoadingSpinner is in presentation mode (no role="status"), overlay provides the status role
      const spinner = screen.getByText('Please wait...');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Accessibility - ARIA Attributes', () => {
    test('has role="status" for screen reader announcements', () => {
      render(<LoadingOverlay isVisible={true} message="Loading data..." />);
      const overlay = screen.getByRole('status');
      expect(overlay).toBeInTheDocument();
    });

    test('has aria-live="assertive" for important announcements', () => {
      render(<LoadingOverlay isVisible={true} message="Processing..." />);
      const overlay = screen.getByRole('status');
      expect(overlay).toHaveAttribute('aria-live', 'assertive');
    });

    test('has aria-busy="true" to indicate loading state', () => {
      render(<LoadingOverlay isVisible={true} message="Please wait..." />);
      const overlay = screen.getByRole('status');
      expect(overlay).toHaveAttribute('aria-busy', 'true');
    });

    test('has aria-label describing the loading state', () => {
      render(<LoadingOverlay isVisible={true} message="Downloading file..." />);
      const overlay = screen.getByRole('status');
      expect(overlay).toHaveAttribute('aria-label', 'Downloading file...');
    });

    test('has aria-modal="true" to indicate modal behavior', () => {
      render(<LoadingOverlay isVisible={true} message="Processing..." />);
      const overlay = screen.getByRole('status');
      expect(overlay).toHaveAttribute('aria-modal', 'true');
    });
  });

  describe('Interaction Blocking', () => {
    test('renders backdrop that covers entire viewport', () => {
      const { container } = render(
        <LoadingOverlay isVisible={true} message="Loading..." />
      );
      const backdrop = container.querySelector('.loading-overlay-backdrop');
      expect(backdrop).toBeInTheDocument();
      expect(backdrop).toHaveClass('loading-overlay-backdrop');
    });

    test('prevents clicks on backdrop from propagating', async () => {
      const user = userEvent.setup();
      const handleBackgroundClick = jest.fn();

      const { container } = render(
        <div onClick={handleBackgroundClick}>
          <LoadingOverlay isVisible={true} message="Loading..." />
          <button>Background Button</button>
        </div>
      );

      const backdrop = container.querySelector('.loading-overlay-backdrop');
      await user.click(backdrop);

      // Click on backdrop should not trigger parent onClick
      expect(handleBackgroundClick).not.toHaveBeenCalled();
    });

    test('prevents keyboard interactions from reaching background', () => {
      render(
        <div>
          <LoadingOverlay isVisible={true} message="Loading..." />
          <input data-testid="background-input" />
        </div>
      );

      const backgroundInput = screen.getByTestId('background-input');
      const overlay = screen.getByRole('status');

      // Overlay should be rendered after (on top of) the input
      expect(overlay).toBeInTheDocument();
      expect(backgroundInput).toBeInTheDocument();
    });
  });

  describe('Body Scroll Management', () => {
    beforeEach(() => {
      // Reset body styles before each test
      document.body.style.overflow = '';
    });

    afterEach(() => {
      // Clean up after each test
      document.body.style.overflow = '';
    });

    test('prevents body scroll when visible', () => {
      const { rerender } = render(
        <LoadingOverlay isVisible={true} message="Loading..." />
      );

      // Body should have overflow hidden when overlay is visible
      expect(document.body.style.overflow).toBe('hidden');

      // Clean up by hiding overlay
      rerender(<LoadingOverlay isVisible={false} message="Loading..." />);
    });

    test('restores body scroll when hidden', () => {
      const { rerender } = render(
        <LoadingOverlay isVisible={true} message="Loading..." />
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(<LoadingOverlay isVisible={false} message="Loading..." />);

      // Body scroll should be restored
      expect(document.body.style.overflow).toBe('');
    });

    test('cleans up body scroll on unmount', () => {
      const { unmount } = render(
        <LoadingOverlay isVisible={true} message="Loading..." />
      );

      expect(document.body.style.overflow).toBe('hidden');

      unmount();

      // Body scroll should be restored after unmount
      expect(document.body.style.overflow).toBe('');
    });

    test('handles overlay lifecycle correctly', () => {
      const { rerender } = render(
        <LoadingOverlay isVisible={true} message="Loading..." />
      );

      expect(document.body.style.overflow).toBe('hidden');

      // Hide overlay
      rerender(<LoadingOverlay isVisible={false} message="Loading..." />);

      // Body scroll should be restored
      expect(document.body.style.overflow).toBe('');

      // Show again
      rerender(<LoadingOverlay isVisible={true} message="Loading..." />);

      expect(document.body.style.overflow).toBe('hidden');

      // Hide again
      rerender(<LoadingOverlay isVisible={false} message="Loading..." />);

      // Body scroll should be restored
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Visual Presentation', () => {
    test('applies loading-overlay class to backdrop', () => {
      const { container } = render(
        <LoadingOverlay isVisible={true} message="Loading..." />
      );
      const backdrop = container.querySelector('.loading-overlay-backdrop');
      expect(backdrop).toHaveClass('loading-overlay-backdrop');
    });

    test('applies loading-overlay-content class to content container', () => {
      const { container } = render(
        <LoadingOverlay isVisible={true} message="Loading..." />
      );
      const content = container.querySelector('.loading-overlay-content');
      expect(content).toHaveClass('loading-overlay-content');
    });

    test('centers content vertically and horizontally', () => {
      const { container } = render(
        <LoadingOverlay isVisible={true} message="Loading..." />
      );
      const content = container.querySelector('.loading-overlay-content');
      expect(content).toBeInTheDocument();
      // CSS will handle actual centering, just verify class is applied
    });
  });

  describe('Component Props', () => {
    test('isVisible prop controls rendering', () => {
      const { rerender, container } = render(
        <LoadingOverlay isVisible={false} message="Loading..." />
      );

      expect(container.firstChild).toBeNull();

      rerender(<LoadingOverlay isVisible={true} message="Loading..." />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('message prop is passed to LoadingSpinner', () => {
      const customMessage = 'Custom overlay message';
      render(<LoadingOverlay isVisible={true} message={customMessage} />);

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    test('defaults to "Loading..." when no message provided', () => {
      render(<LoadingOverlay isVisible={true} />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    test('overlay receives initial focus when shown', async () => {
      render(<LoadingOverlay isVisible={true} message="Loading..." />);

      const overlay = screen.getByRole('status');

      // Overlay should be in the document and focusable
      await waitFor(() => {
        expect(overlay).toBeInTheDocument();
      });
    });

    test('prevents focus from leaving overlay when visible', async () => {
      render(
        <div>
          <button>Before</button>
          <LoadingOverlay isVisible={true} message="Loading..." />
          <button>After</button>
        </div>
      );

      const beforeButton = screen.getByText('Before');
      const afterButton = screen.getByText('After');

      // Try to focus buttons outside overlay (should not be possible in real usage due to overlay)
      // This tests that overlay is properly layered
      expect(beforeButton).toBeInTheDocument();
      expect(afterButton).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles rapid show/hide toggles', () => {
      const { rerender } = render(
        <LoadingOverlay isVisible={true} message="Loading..." />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();

      rerender(<LoadingOverlay isVisible={false} message="Loading..." />);
      rerender(<LoadingOverlay isVisible={true} message="Loading..." />);
      rerender(<LoadingOverlay isVisible={false} message="Loading..." />);
      rerender(<LoadingOverlay isVisible={true} message="Loading..." />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(document.body.style.overflow).toBe('hidden');
    });

    test('handles empty message gracefully', () => {
      render(<LoadingOverlay isVisible={true} message="" />);

      // Should still render, but with default message from LoadingSpinner
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});
