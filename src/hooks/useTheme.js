import { useState, useEffect } from 'react';

const THEME_KEY = 'ethogram-theme';
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

/**
 * Custom hook for managing theme state and persistence.
 *
 * Behavior:
 * - Initializes from localStorage if available
 * - Falls back to system preference if no saved preference
 * - Persists theme changes to localStorage
 * - Updates document root data attribute for CSS
 *
 * @returns {Object} { theme: 'light'|'dark', toggleTheme: () => void }
 */
export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    // Try to get saved theme from localStorage
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
      return savedTheme;
    }

    // Fall back to system preference
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return THEMES.DARK;
    }

    return THEMES.LIGHT;
  });

  useEffect(() => {
    // Update document root data attribute
    document.documentElement.setAttribute('data-theme', theme);

    // Persist to localStorage
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT
    );
  };

  return { theme, toggleTheme };
};
