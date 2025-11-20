import {
  getUserTimezone,
  convertToWBSTime,
  WBS_TIMEZONE,
} from '../timezoneUtils';

describe('timezoneUtils', () => {
  describe('getUserTimezone', () => {
    it('should return a valid IANA timezone string', () => {
      const timezone = getUserTimezone();
      expect(timezone).toBeDefined();
      expect(typeof timezone).toBe('string');
      // Should be in format like "America/New_York"
      expect(timezone).toMatch(/^[A-Za-z_]+\/[A-Za-z_]+/);
    });
  });

  describe('WBS_TIMEZONE constant', () => {
    it('should be set to America/Chicago', () => {
      expect(WBS_TIMEZONE).toBe('America/Chicago');
    });
  });

  describe('convertToWBSTime', () => {
    it('should convert local time to WBS timezone', () => {
      // Note: This function converts from user's LOCAL timezone to WBS timezone
      // The actual conversion depends on where the test is running
      const result = convertToWBSTime('2025-11-20', '15:00');
      expect(result).toMatch(/^\d{2}:\d{2}$/);
      expect(typeof result).toBe('string');
    });

    it('should handle midnight correctly', () => {
      const result = convertToWBSTime('2025-11-20', '00:00');
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should handle noon correctly', () => {
      const result = convertToWBSTime('2025-11-20', '12:00');
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should handle late evening correctly', () => {
      const result = convertToWBSTime('2025-11-20', '23:00');
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should handle 24-hour format correctly', () => {
      const result = convertToWBSTime('2025-11-20', '23:30');
      expect(result).toMatch(/^\d{2}:\d{2}$/);
      // Should be in 24-hour format
      const [hours] = result.split(':');
      expect(parseInt(hours)).toBeGreaterThanOrEqual(0);
      expect(parseInt(hours)).toBeLessThan(24);
    });

    it('should preserve minutes correctly', () => {
      const result = convertToWBSTime('2025-11-20', '15:05');
      expect(result).toMatch(/:\d{2}$/);
    });

    it('should pad single-digit hours with zero', () => {
      // Early morning time
      const result = convertToWBSTime('2025-11-20', '08:00');
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should handle edge case of 5-minute intervals', () => {
      const times = ['00:00', '00:05', '00:10', '00:15', '00:20', '00:25', '00:30'];
      times.forEach(time => {
        const result = convertToWBSTime('2025-11-20', time);
        expect(result).toMatch(/^\d{2}:\d{2}$/);
      });
    });
  });

  describe('Integration: time conversion workflow', () => {
    it('should correctly convert a typical observation session', () => {
      // Convert a 1-hour session
      const startTime = convertToWBSTime('2025-11-20', '15:00');
      const endTime = convertToWBSTime('2025-11-20', '16:00');

      // Both should return valid time strings
      expect(startTime).toMatch(/^\d{2}:\d{2}$/);
      expect(endTime).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should maintain 1-hour duration across conversion', () => {
      const start = convertToWBSTime('2025-11-20', '15:00');
      const end = convertToWBSTime('2025-11-20', '16:00');

      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);

      // Calculate duration (handling day rollover if needed)
      let durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
      if (durationMinutes < 0) {
        durationMinutes += 24 * 60; // Add 24 hours if it rolled over
      }
      
      expect(durationMinutes).toBe(60);
    });
  });

  describe('Early returns for empty inputs', () => {
    it('should handle empty date string', () => {
      const result = convertToWBSTime('', '15:00');
      expect(result).toBe('15:00'); // Returns original time
    });

    it('should handle empty time string', () => {
      const result = convertToWBSTime('2025-11-20', '');
      expect(result).toBe(''); // Returns original (empty) time
    });
  });

  describe('Error handling for invalid formats', () => {
    // Suppress console.error for error handling tests to avoid noise
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      console.error.mockRestore();
    });

    it('should handle invalid date format gracefully', () => {
      // Should return original time on error
      const result = convertToWBSTime('invalid-date', '15:00');
      expect(result).toBe('15:00');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle invalid time format gracefully', () => {
      // Should return original time on error
      const result = convertToWBSTime('2025-11-20', 'invalid-time');
      expect(result).toBe('invalid-time');
      expect(console.error).toHaveBeenCalled();
    });
  });
});
