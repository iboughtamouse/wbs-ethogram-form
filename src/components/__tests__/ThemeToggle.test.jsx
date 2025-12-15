import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from '../ThemeToggle';

describe('ThemeToggle', () => {
  describe('rendering', () => {
    it('should render toggle button', () => {
      const mockToggle = jest.fn();
      render(<ThemeToggle theme="light" onToggle={mockToggle} />);

      const button = screen.getByRole('button', {
        name: /switch to dark theme/i,
      });
      expect(button).toBeInTheDocument();
    });

    it('should display moon icon and "Dark Mode" label in light theme', () => {
      const mockToggle = jest.fn();
      render(<ThemeToggle theme="light" onToggle={mockToggle} />);

      expect(screen.getByText('🌙')).toBeInTheDocument();
      expect(screen.getByText('Dark Mode')).toBeInTheDocument();
    });

    it('should display sun icon and "Light Mode" label in dark theme', () => {
      const mockToggle = jest.fn();
      render(<ThemeToggle theme="dark" onToggle={mockToggle} />);

      expect(screen.getByText('☀️')).toBeInTheDocument();
      expect(screen.getByText('Light Mode')).toBeInTheDocument();
    });

    it('should have appropriate aria-label for light theme', () => {
      const mockToggle = jest.fn();
      render(<ThemeToggle theme="light" onToggle={mockToggle} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark theme');
    });

    it('should have appropriate aria-label for dark theme', () => {
      const mockToggle = jest.fn();
      render(<ThemeToggle theme="dark" onToggle={mockToggle} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to light theme');
    });
  });

  describe('interaction', () => {
    it('should call onToggle when clicked', async () => {
      const mockToggle = jest.fn();
      const user = userEvent.setup();

      render(<ThemeToggle theme="light" onToggle={mockToggle} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('should call onToggle multiple times on multiple clicks', async () => {
      const mockToggle = jest.fn();
      const user = userEvent.setup();

      render(<ThemeToggle theme="light" onToggle={mockToggle} />);

      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockToggle).toHaveBeenCalledTimes(3);
    });

    it('should be keyboard accessible', async () => {
      const mockToggle = jest.fn();
      const user = userEvent.setup();

      render(<ThemeToggle theme="light" onToggle={mockToggle} />);

      const button = screen.getByRole('button');
      button.focus();

      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(mockToggle).toHaveBeenCalledTimes(1);
    });
  });
});
