import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PerchDiagramModal from '../PerchDiagramModal';
import { bundledConfig } from '../../services/configService';
import { adaptConfig } from '../../services/configAdapter';

// The modal is driven by useConfig().perchDiagrams; without a provider it
// falls back to the adapted bundled config, so derive fixtures from it.
const { perchDiagrams } = adaptConfig(bundledConfig);

describe('PerchDiagramModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('Modal visibility', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <PerchDiagramModal isOpen={false} onClose={mockOnClose} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(<PerchDiagramModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Perch Reference')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<PerchDiagramModal isOpen={true} onClose={mockOnClose} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'perch-modal-title');
    });

    it('should have accessible close button', () => {
      render(<PerchDiagramModal isOpen={true} onClose={mockOnClose} />);
      const closeButton = screen.getByLabelText('Close perch diagram');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Close button interaction', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<PerchDiagramModal isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('Close perch diagram');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard interactions', () => {
    it('should call onClose when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(<PerchDiagramModal isOpen={true} onClose={mockOnClose} />);

      const dialog = screen.getByRole('dialog');
      await user.type(dialog, '{Escape}');

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Backdrop click interaction', () => {
    it('should call onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      render(<PerchDiagramModal isOpen={true} onClose={mockOnClose} />);

      const backdrop = screen.getByRole('dialog');
      await user.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when modal content is clicked', async () => {
      const user = userEvent.setup();
      render(<PerchDiagramModal isOpen={true} onClose={mockOnClose} />);

      const modalTitle = screen.getByText('Perch Reference');
      await user.click(modalTitle);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Tab switching', () => {
    // Config-driven: labels/URLs come from the bundled config's perchDiagrams,
    // so these survive a diagram re-catalog (e.g. the 009 three-view set)
    // without hardcoded label assertions.
    const [first, second] = perchDiagrams;

    it('should show the first tab active by default', () => {
      render(<PerchDiagramModal isOpen={true} onClose={mockOnClose} />);
      const firstTab = screen.getByRole('button', { name: first.label });
      expect(firstTab).toHaveClass('active');
    });

    it('should switch to the second tab when clicked', async () => {
      const user = userEvent.setup();
      render(<PerchDiagramModal isOpen={true} onClose={mockOnClose} />);

      const secondTab = screen.getByRole('button', { name: second.label });
      await user.click(secondTab);

      expect(secondTab).toHaveClass('active');
    });

    it('should switch back to the first tab when clicked', async () => {
      const user = userEvent.setup();
      render(<PerchDiagramModal isOpen={true} onClose={mockOnClose} />);

      const secondTab = screen.getByRole('button', { name: second.label });
      await user.click(secondTab);

      const firstTab = screen.getByRole('button', { name: first.label });
      await user.click(firstTab);

      expect(firstTab).toHaveClass('active');
      expect(secondTab).not.toHaveClass('active');
    });

    it('should show the correct image + alt for the first tab', () => {
      const { container } = render(
        <PerchDiagramModal isOpen={true} onClose={mockOnClose} />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', first.url);
      expect(img).toHaveAttribute(
        'alt',
        `Perches: ${first.label} — Sayyida's Cove`
      );
    });

    it('should show the correct image + alt for the second tab', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <PerchDiagramModal isOpen={true} onClose={mockOnClose} />
      );

      await user.click(screen.getByRole('button', { name: second.label }));

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', second.url);
      expect(img).toHaveAttribute(
        'alt',
        `Perches: ${second.label} — Sayyida's Cove`
      );
    });

    it('should render one tab per configured diagram and swap the image src on switch', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <PerchDiagramModal isOpen={true} onClose={mockOnClose} />
      );

      // The 009 re-catalog ships three diagram views; one tab renders per view
      expect(perchDiagrams).toHaveLength(3);
      perchDiagrams.forEach(({ label }) => {
        expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
      });

      // First diagram shows by default; switching tabs swaps to the other URL
      expect(container.querySelector('img')).toHaveAttribute('src', first.url);

      await user.click(screen.getByRole('button', { name: second.label }));
      expect(container.querySelector('img')).toHaveAttribute('src', second.url);
    });
  });

  describe('Image rendering', () => {
    it('should render a plain img from the config URL (no WebP picture wrapper)', () => {
      const { container } = render(
        <PerchDiagramModal isOpen={true} onClose={mockOnClose} />
      );

      // Config URLs are used as-is (may be bundled assets or R2 URLs), so
      // there is no <picture>/<source> WebP variant — just one <img>.
      expect(container.querySelector('picture')).toBeNull();

      const images = container.querySelectorAll('img');
      expect(images).toHaveLength(1);
      expect(images[0]).toHaveAttribute('src', perchDiagrams[0].url);
    });
  });

  describe('Modal content', () => {
    it('should display footer hint text', () => {
      render(<PerchDiagramModal isOpen={true} onClose={mockOnClose} />);
      expect(
        screen.getByText(
          'Reference the perch numbers, then type the location in the form.'
        )
      ).toBeInTheDocument();
    });
  });
});
