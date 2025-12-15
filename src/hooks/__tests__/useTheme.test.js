import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    // Clear localStorage and reset document attribute
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');

    // Reset matchMedia to default (light theme)
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  describe('initialization', () => {
    it('should initialize with light theme by default', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe('light');
    });

    it('should initialize from localStorage if available', () => {
      localStorage.setItem('ethogram-theme', 'dark');
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe('dark');
    });

    it('should ignore invalid localStorage values', () => {
      localStorage.setItem('ethogram-theme', 'invalid-theme');
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe('light');
    });

    it('should respect system preference when no saved theme', () => {
      // Mock matchMedia to return dark preference
      const matchMediaMock = jest.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
      window.matchMedia = matchMediaMock;

      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe('dark');
    });
  });

  describe('theme toggle', () => {
    it('should toggle from light to dark', () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe('light');

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      localStorage.setItem('ethogram-theme', 'dark');
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe('dark');

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');
    });

    it('should toggle back and forth multiple times', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme(); // light -> dark
      });
      expect(result.current.theme).toBe('dark');

      act(() => {
        result.current.toggleTheme(); // dark -> light
      });
      expect(result.current.theme).toBe('light');

      act(() => {
        result.current.toggleTheme(); // light -> dark
      });
      expect(result.current.theme).toBe('dark');
    });
  });

  describe('persistence', () => {
    it('should persist theme to localStorage on change', () => {
      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(localStorage.getItem('ethogram-theme')).toBe('dark');
    });

    it('should update document data-theme attribute', () => {
      const { result } = renderHook(() => useTheme());

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');

      act(() => {
        result.current.toggleTheme();
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should persist initial theme from localStorage', () => {
      localStorage.setItem('ethogram-theme', 'dark');
      renderHook(() => useTheme());

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });
});
