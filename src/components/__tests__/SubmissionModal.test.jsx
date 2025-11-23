import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubmissionModal, { SUBMISSION_STATES } from '../SubmissionModal';

describe('SubmissionModal', () => {
  const mockOnClose = jest.fn();
  const mockOnEmailChange = jest.fn();
  const mockOnEmailSubmit = jest.fn();
  const mockOnDownload = jest.fn();
  const mockOnRetry = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    submissionState: SUBMISSION_STATES.READY,
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

    it('should have accessible close button in READY state', () => {
      render(<SubmissionModal {...defaultProps} />);
      const closeButton = screen.getByLabelText('Close submission modal');
      expect(closeButton).toBeInTheDocument();
    });

    it('should not show close button in GENERATING state', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.GENERATING}
        />
      );
      expect(
        screen.queryByLabelText('Close submission modal')
      ).not.toBeInTheDocument();
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

  describe('GENERATING state', () => {
    it('should show loading spinner and message', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.GENERATING}
        />
      );
      expect(
        screen.getByText('Generating Excel spreadsheet...')
      ).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should display correct title', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.GENERATING}
        />
      );
      expect(screen.getByText('Generating Spreadsheet')).toBeInTheDocument();
    });

    it('should not allow closing via ESC key', async () => {
      const user = userEvent.setup();
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.GENERATING}
        />
      );

      const dialog = screen.getByRole('dialog');
      await user.type(dialog, '{Escape}');

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not allow closing via backdrop click', async () => {
      const user = userEvent.setup();
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.GENERATING}
        />
      );

      const backdrop = screen.getByRole('dialog');
      await user.click(backdrop);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('READY state', () => {
    it('should show email input and action buttons', () => {
      render(<SubmissionModal {...defaultProps} />);
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /download excel/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /send via email/i })
      ).toBeInTheDocument();
    });

    it('should display instructions', () => {
      render(<SubmissionModal {...defaultProps} />);
      expect(
        screen.getByText(/your observation data has been prepared/i)
      ).toBeInTheDocument();
    });

    it('should call onEmailChange when email input changes', async () => {
      const user = userEvent.setup();
      render(<SubmissionModal {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');

      expect(mockOnEmailChange).toHaveBeenCalled();
    });

    it('should call onDownload when Download button is clicked', async () => {
      const user = userEvent.setup();
      render(<SubmissionModal {...defaultProps} />);

      const downloadButton = screen.getByRole('button', {
        name: /download excel/i,
      });
      await user.click(downloadButton);

      expect(mockOnDownload).toHaveBeenCalledTimes(1);
    });

    it('should disable Send button when email is empty', () => {
      render(<SubmissionModal {...defaultProps} email="" />);
      const sendButton = screen.getByRole('button', {
        name: /send via email/i,
      });
      expect(sendButton).toBeDisabled();
    });

    it('should enable Send button when email has value', () => {
      render(<SubmissionModal {...defaultProps} email="test@example.com" />);
      const sendButton = screen.getByRole('button', {
        name: /send via email/i,
      });
      expect(sendButton).not.toBeDisabled();
    });

    it('should call onEmailSubmit when form is submitted', async () => {
      const user = userEvent.setup();
      render(<SubmissionModal {...defaultProps} email="test@example.com" />);

      const sendButton = screen.getByRole('button', {
        name: /send via email/i,
      });
      await user.click(sendButton);

      expect(mockOnEmailSubmit).toHaveBeenCalledTimes(1);
    });

    it('should not call onEmailSubmit if email has error', async () => {
      const user = userEvent.setup();
      render(
        <SubmissionModal
          {...defaultProps}
          email="invalid"
          emailError="Invalid email format"
        />
      );

      const sendButton = screen.getByRole('button', {
        name: /send via email/i,
      });
      await user.click(sendButton);

      expect(mockOnEmailSubmit).not.toHaveBeenCalled();
    });

    it('should not show error message before submit attempt', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          email="invalid"
          emailError="Invalid email format"
        />
      );

      // Error should not be visible until user attempts to submit
      expect(
        screen.queryByText('Invalid email format')
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should show hint when no email error', () => {
      render(<SubmissionModal {...defaultProps} />);
      expect(
        screen.getByText('Leave blank to download only')
      ).toBeInTheDocument();
    });

    it('should allow closing via ESC key', async () => {
      const user = userEvent.setup();
      render(<SubmissionModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      await user.type(dialog, '{Escape}');

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should allow closing via close button', async () => {
      const user = userEvent.setup();
      render(<SubmissionModal {...defaultProps} />);

      const closeButton = screen.getByLabelText('Close submission modal');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('SUBMITTING state', () => {
    it('should show loading spinner and message', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUBMITTING}
        />
      );
      expect(screen.getByText('Sending email...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should display correct title', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUBMITTING}
        />
      );
      expect(screen.getByText('Sending Email')).toBeInTheDocument();
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
    it('should show success message with email address', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUCCESS}
          email="test@example.com"
        />
      );
      expect(screen.getByText('Email Sent Successfully!')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should display correct title', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUCCESS}
        />
      );
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    it('should show Download and Close buttons', () => {
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUCCESS}
        />
      );
      expect(
        screen.getByRole('button', { name: /download excel/i })
      ).toBeInTheDocument();

      // Get all buttons and find the "Close" action button (not the × button)
      const buttons = screen.getAllByRole('button');
      const closeButton = buttons.find((btn) => btn.textContent === 'Close');
      expect(closeButton).toBeInTheDocument();
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

    it('should call onClose when Close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SubmissionModal
          {...defaultProps}
          submissionState={SUBMISSION_STATES.SUCCESS}
        />
      );

      // Get all buttons and find the "Close" action button (not the × button)
      const buttons = screen.getAllByRole('button');
      const closeButton = buttons.find((btn) => btn.textContent === 'Close');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
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
    it('should submit form on Enter in email input', async () => {
      const user = userEvent.setup();
      render(<SubmissionModal {...defaultProps} email="test@example.com" />);

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, '{Enter}');

      expect(mockOnEmailSubmit).toHaveBeenCalled();
    });
  });

  describe('Backdrop click interaction', () => {
    it('should call onClose when backdrop is clicked in READY state', async () => {
      const user = userEvent.setup();
      render(<SubmissionModal {...defaultProps} />);

      const backdrop = screen.getByRole('dialog');
      await user.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when modal content is clicked', async () => {
      const user = userEvent.setup();
      render(<SubmissionModal {...defaultProps} />);

      const modalTitle = screen.getByText('Submit Observation Data');
      await user.click(modalTitle);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
