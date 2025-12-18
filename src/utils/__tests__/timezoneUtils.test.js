import {
  getUserTimezone,
  convertToWBSTime,
  isUserInDifferentTimezone,
  getTimezoneAbbreviation,
  WBS_TIMEZONE,
} from '../timezoneUtils';

describe('timezoneUtils (deprecated)', () => {
  describe('WBS_TIMEZONE constant', () => {
    it('should be set to America/Chicago', () => {
      expect(WBS_TIMEZONE).toBe('America/Chicago');
    });
  });

  describe('getUserTimezone (deprecated)', () => {
    it('should warn about deprecation and return WBS_TIMEZONE', () => {
      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const result = getUserTimezone();

      expect(result).toBe('America/Chicago');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('deprecated')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('convertToWBSTime (deprecated)', () => {
    it('should warn about deprecation and pass through time unchanged', () => {
      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const result = convertToWBSTime('2025-11-20', '15:00');

      expect(result).toBe('15:00'); // Pass through unchanged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('deprecated')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should preserve time value (pass through)', () => {
      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      expect(convertToWBSTime('2025-11-20', '00:00')).toBe('00:00');
      expect(convertToWBSTime('2025-11-20', '12:00')).toBe('12:00');
      expect(convertToWBSTime('2025-11-20', '23:30')).toBe('23:30');
      expect(convertToWBSTime('2025-11-20', '15:05')).toBe('15:05');

      consoleWarnSpy.mockRestore();
    });

    it('should handle empty inputs', () => {
      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      expect(convertToWBSTime('', '15:00')).toBe('15:00');
      expect(convertToWBSTime('2025-11-20', '')).toBe('');

      consoleWarnSpy.mockRestore();
    });
  });

  describe('isUserInDifferentTimezone (deprecated)', () => {
    it('should warn about deprecation and always return false', () => {
      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const result = isUserInDifferentTimezone();

      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('deprecated')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('getTimezoneAbbreviation (deprecated)', () => {
    it('should warn about deprecation and pass through timezone', () => {
      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const result = getTimezoneAbbreviation('America/Chicago');

      expect(result).toBe('America/Chicago');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('deprecated')
      );

      consoleWarnSpy.mockRestore();
    });
  });
});
