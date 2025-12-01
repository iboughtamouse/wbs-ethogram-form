import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubmissionModal from '../SubmissionModal';
import { SUBMISSION_STATES } from '../../constants/ui';

describe('SubmissionModal', () => {
  const mockOnClose = jest.fn();
  const mockOnEmailChange = jest.fn();
  const mockOnEmailSubmit = jest.fn();
  const mockOnDownload = jest.fn();
  const mockOnRetry = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    submissionState: SUBMISSION_STATES.SUBMITTING,
    errorMessage: '',
    isTransientError: false,
    email: '',
    emailError: '',
    onEmailChange: mockOnEmailChange,
    onEmailSubmit: mockOnEmailSubmit,
    onDownload: mockOnDownload,
    onRetry: mockOnRetry,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal visibility', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <SubmissionModal {...defaultProps} isOpen={false} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(<SubmissionModal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<SubmissionModal {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute(
        'aria-labelledby',
        'submission-modal-title'
      );
    });

    it('should have accessible close button in SUCCESS state', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUCCESS}
        />
      );
      const closeButton = screen.getByLabelText('Close submission modal');
      expect(closeButton).toBeInTheDocument();
    });

    it('should have accessible close button in ERROR state', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.ERROR}
          errorMessage="Test error"
        />
      );
      const closeButton = screen.getByLabelText('Close submission modal');
      expect(closeButton).toBeInTheDocument();
    });

    it('should not show close button in SUBMITTING state', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUBMITTING}
        />
      );
      expect(
        screen.queryByLabelText('Close submission modal')
      ).not.toBeInTheDocument();
    });
  });

  // Note: GENERATING and READY states removed in backend integration
  // New flow: Submit → SUBMITTING → SUCCESS (with download/share) or ERROR

  describe('SUBMITTING state', () => {
    it('should show loading spinner and message', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUBMITTING}
        />
      );
      expect(screen.getByText('Submitting observation...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should display correct title', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUBMITTING}
        />
      );
      expect(screen.getByText('Submitting Observation')).toBeInTheDocument();
    });

    it('should not show close button', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUBMITTING}
        />
      );
      expect(
        screen.queryByLabelText('Close submission modal')
      ).not.toBeInTheDocument();
    });

    it('should not allow closing via ESC key', async () => {
      const user = userEvent.setup();
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUBMITTING}
        />
      );

      const dialog = screen.getByRole('dialog');
      await user.type(dialog, '{Escape}');

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('SUCCESS state', () => {
    it('should show success message', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUCCESS}
        />
      );
      expect(screen.getByText('Observation Submitted!')).toBeInTheDocument();
      expect(
        screen.getByText(/successfully saved and sent to WBS/i)
      ).toBeInTheDocument();
    });

    it('should display correct title', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUCCESS}
        />
      );
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    it('should show Download button and Share section', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUCCESS}
        />
      );
      expect(
        screen.getByRole('button', { name: /download excel/i })
      ).toBeInTheDocument();
      expect(screen.getByText('Share via Email')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /share/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument();
    });

    it('should show email input in share section', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUCCESS}
        />
      );
      const emailInput = screen.getByPlaceholderText(/enter email address/i);
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'text');
      expect(emailInput).toHaveAttribute('inputMode', 'email');
    });

    it('should disable Share button when email is empty', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUCCESS}
          email=""
        />
      );
      const shareButton = screen.getByRole('button', { name: /share/i });
      expect(shareButton).toBeDisabled();
    });

    it('should enable Share button when email has value', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUCCESS}
          email="test@example.com"
        />
      );
      const shareButton = screen.getByRole('button', { name: /share/i });
      expect(shareButton).not.toBeDisabled();
    });

    it('should call onDownload when Download button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUCCESS}
        />
      );

      const downloadButton = screen.getByRole('button', {
        name: /download excel/i,
      });
      await user.click(downloadButton);

      expect(mockOnDownload).toHaveBeenCalledTimes(1);
    });

    it('should call onEmailSubmit when Share button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUCCESS}
          email="test@example.com"
        />
      );

      const shareButton = screen.getByRole('button', { name: /share/i });
      await user.click(shareButton);

      expect(mockOnEmailSubmit).toHaveBeenCalledTimes(1);
    });

    it('should disable Share button when email has error', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUCCESS}
          email="invalid"
          emailError="Invalid email format"
        />
      );
      const shareButton = screen.getByRole('button', { name: /share/i });
      expect(shareButton).toBeDisabled();
    });

    it('should call onEmailChange when typing in share email input', async () => {
      const user = userEvent.setup();
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUCCESS}
        />
      );

      const emailInput = screen.getByPlaceholderText(/enter email address/i);
      await user.type(emailInput, 'test@example.com');

      expect(mockOnEmailChange).toHaveBeenCalled();
    });

    it('should call onClose when Done button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUCCESS}
        />
      );

      const doneButton = screen.getByRole('button', { name: /done/i });
      await user.click(doneButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should display email error when present', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUCCESS}
          email="invalid"
          emailError="Invalid email format"
        />
      );
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Invalid email format'
      );
    });
  });

  describe('ERROR state - transient error', () => {
    const transientErrorProps = {
      ...defaultProps,
      submissionState: SUBMISSION_STATES.ERROR,
      errorMessage: 'Network timeout. Please try again.',
      isTransientError: true,
    };

    it('should show error message and hint', () => {
      render(<SubmissionModal {...transientErrorProps} />);
      expect(
        screen.getByText('Network timeout. Please try again.')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/this appears to be a temporary issue/i)
      ).toBeInTheDocument();
    });

    it('should display "Temporary Issue" title', () => {
      render(<SubmissionModal {...transientErrorProps} />);
      expect(screen.getByText('Temporary Issue')).toBeInTheDocument();
    });

    it('should show Download Anyway and Try Again buttons', () => {
      render(<SubmissionModal {...transientErrorProps} />);
      expect(
        screen.getByRole('button', { name: /download anyway/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /try again/i })
      ).toBeInTheDocument();
    });

    it('should call onDownload when Download Anyway is clicked', async () => {
      const user = userEvent.setup();
      render(<SubmissionModal {...transientErrorProps} />);

      const downloadButton = screen.getByRole('button', {
        name: /download anyway/i,
      });
      await user.click(downloadButton);

      expect(mockOnDownload).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry when Try Again is clicked', async () => {
      const user = userEvent.setup();
      render(<SubmissionModal {...transientErrorProps} />);

      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it('should have error message marked with role="alert"', () => {
      render(<SubmissionModal {...transientErrorProps} />);
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent(
        'Network timeout. Please try again.'
      );
    });
  });

  describe('ERROR state - permanent error', () => {
    const permanentErrorProps = {
      ...defaultProps,
      submissionState: SUBMISSION_STATES.ERROR,
      errorMessage: 'Invalid email address format.',
      isTransientError: false,
    };

    it('should show error message without retry hint', () => {
      render(<SubmissionModal {...permanentErrorProps} />);
      expect(
        screen.getByText('Invalid email address format.')
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/this appears to be a temporary issue/i)
      ).not.toBeInTheDocument();
    });

    it('should display "Submission Failed" title', () => {
      render(<SubmissionModal {...permanentErrorProps} />);
      expect(screen.getByText('Submission Failed')).toBeInTheDocument();
    });

    it('should show Download Anyway and Close buttons (no Try Again)', () => {
      render(<SubmissionModal {...permanentErrorProps} />);
      expect(
        screen.getByRole('button', { name: /download anyway/i })
      ).toBeInTheDocument();

      // Get all buttons and find the "Close" action button (not the × button)
      const buttons = screen.getAllByRole('button');
      const closeButton = buttons.find((btn) => btn.textContent === 'Close');
      expect(closeButton).toBeInTheDocument();

      expect(
        screen.queryByRole('button', { name: /try again/i })
      ).not.toBeInTheDocument();
    });

    it('should show default error message when none provided', () => {
      render(<SubmissionModal {...permanentErrorProps} errorMessage="" />);
      expect(
        screen.getByText('An unexpected error occurred.')
      ).toBeInTheDocument();
    });
  });

  describe('Keyboard interactions', () => {
    it('should allow closing SUCCESS state via ESC key', async () => {
      const user = userEvent.setup();
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUCCESS}
        />
      );

      const dialog = screen.getByRole('dialog');
      await user.type(dialog, '{Escape}');

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should allow closing ERROR state via ESC key', async () => {
      const user = userEvent.setup();
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.ERROR}
          errorMessage="Test error"
          isTransientError={true}
        />
      );

      const dialog = screen.getByRole('dialog');
      await user.type(dialog, '{Escape}');

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Backdrop click interaction', () => {
    it('should call onClose when backdrop is clicked in SUCCESS state', async () => {
      const user = userEvent.setup();
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUCCESS}
        />
      );

      const backdrop = screen.getByRole('dialog');
      await user.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when modal content is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUCCESS}
        />
      );

      const modalTitle = screen.getByText('Success!');
      await user.click(modalTitle);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not call onClose when backdrop clicked in SUBMITTING state', async () => {
      const user = userEvent.setup();
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUBMITTING}
        />
      );

      const backdrop = screen.getByRole('dialog');
      await user.click(backdrop);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
