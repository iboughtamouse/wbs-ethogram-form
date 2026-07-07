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
    it('should show NE Half tab by default', () => {
      render(<PerchDiagramModal isOpen={true} onClose={mockOnClose} />);
      const neTab = screen.getByRole('button', {
        name: /NE Half \(Perches 1-18\)/i,
      });
      expect(neTab).toHaveClass('active');
    });

    it('should switch to SW Half tab when clicked', async () => {
      const user = userEvent.setup();
      render(<PerchDiagramModal isOpen={true} onClose={mockOnClose} />);

      const swTab = screen.getByRole('button', {
        name: /SW Half \(Perches 19-31, BB, F, W\)/i,
      });
      await user.click(swTab);

      expect(swTab).toHaveClass('active');
    });

    it('should switch back to NE Half tab when clicked', async () => {
      const user = userEvent.setup();
      render(<PerchDiagramModal isOpen={true} onClose={mockOnClose} />);

      // Switch to SW
      const swTab = screen.getByRole('button', {
        name: /SW Half \(Perches 19-31, BB, F, W\)/i,
      });
      await user.click(swTab);

      // Switch back to NE
      const neTab = screen.getByRole('button', {
        name: /NE Half \(Perches 1-18\)/i,
      });
      await user.click(neTab);

      expect(neTab).toHaveClass('active');
      expect(swTab).not.toHaveClass('active');
    });

    it('should show correct image for NE Half tab', () => {
      const { container } = render(
        <PerchDiagramModal isOpen={true} onClose={mockOnClose} />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute(
        'src',
        'https://pub-f2f3822bc5384a4a9b824b196e990a21.r2.dev/perch-diagram-sayyidas-cove-ne-half-v1.webp'
      );
      expect(img).toHaveAttribute(
        'alt',
        "Perches: NE Half (Perches 1-18) — Sayyida's Cove"
      );
    });

    it('should show correct image for SW Half tab', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <PerchDiagramModal isOpen={true} onClose={mockOnClose} />
      );

      const swTab = screen.getByRole('button', {
        name: /SW Half \(Perches 19-31, BB, F, W\)/i,
      });
      await user.click(swTab);

      const img = container.querySelector('img');
      expect(img).toHaveAttribute(
        'src',
        'https://pub-f2f3822bc5384a4a9b824b196e990a21.r2.dev/perch-diagram-sayyidas-cove-sw-half-v1.webp'
      );
      expect(img).toHaveAttribute(
        'alt',
        "Perches: SW Half (Perches 19-31, BB, F, W) — Sayyida's Cove"
      );
    });

    it('should render one tab per configured diagram and swap the image src on switch', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <PerchDiagramModal isOpen={true} onClose={mockOnClose} />
      );

      // Both config-driven tabs render with the config labels
      expect(perchDiagrams).toHaveLength(2);
      perchDiagrams.forEach(({ label }) => {
        expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
      });

      // First diagram shows by default; switching tabs swaps to the other URL
      expect(container.querySelector('img')).toHaveAttribute(
        'src',
        perchDiagrams[0].url
      );

      await user.click(
        screen.getByRole('button', { name: perchDiagrams[1].label })
      );
      expect(container.querySelector('img')).toHaveAttribute(
        'src',
        perchDiagrams[1].url
      );
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
      expect(images[0]).toHaveAttribute(
        'src',
        'https://pub-f2f3822bc5384a4a9b824b196e990a21.r2.dev/perch-diagram-sayyidas-cove-ne-half-v1.webp'
      );
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
