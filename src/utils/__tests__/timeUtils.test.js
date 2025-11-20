import {
  formatTo12Hour,
  generateTimeSlots,
  validateTimeRange,
  roundToNearestFiveMinutes,
} from '../timeUtils';

describe('timeUtils', () => {
  describe('formatTo12Hour', () => {
    it('should format midnight correctly', () => {
      expect(formatTo12Hour('00:00')).toBe('12:00 AM');
    });

    it('should format morning times correctly', () => {
      expect(formatTo12Hour('09:30')).toBe('9:30 AM');
      expect(formatTo12Hour('11:45')).toBe('11:45 AM');
    });

    it('should format noon correctly', () => {
      expect(formatTo12Hour('12:00')).toBe('12:00 PM');
    });

    it('should format afternoon times correctly', () => {
      expect(formatTo12Hour('13:15')).toBe('1:15 PM');
      expect(formatTo12Hour('15:05')).toBe('3:05 PM');
      expect(formatTo12Hour('23:59')).toBe('11:59 PM');
    });

    it('should handle single-digit hours without padding', () => {
      expect(formatTo12Hour('01:00')).toBe('1:00 AM');
      expect(formatTo12Hour('13:00')).toBe('1:00 PM');
    });

    it('should return empty string for empty input', () => {
      expect(formatTo12Hour('')).toBe('');
      expect(formatTo12Hour(null)).toBe('');
      expect(formatTo12Hour(undefined)).toBe('');
    });
  });

  describe('generateTimeSlots', () => {
    it('should generate 5-minute intervals within range', () => {
      const slots = generateTimeSlots('09:00', '09:30');
      expect(slots).toEqual([
        '09:00',
        '09:05',
        '09:10',
        '09:15',
        '09:20',
        '09:25',
      ]);
    });

    it('should generate slots for a full hour', () => {
      const slots = generateTimeSlots('14:00', '15:00');
      expect(slots).toHaveLength(12);
      expect(slots[0]).toBe('14:00');
      expect(slots[11]).toBe('14:55');
    });

    it('should not include the end time (end-exclusive)', () => {
      const slots = generateTimeSlots('10:00', '10:15');
      expect(slots).toEqual(['10:00', '10:05', '10:10']);
      expect(slots).not.toContain('10:15');
    });

    it('should handle cross-hour boundaries', () => {
      const slots = generateTimeSlots('09:50', '10:10');
      expect(slots).toEqual(['09:50', '09:55', '10:00', '10:05']);
    });

    it('should return empty array if start or end is missing', () => {
      expect(generateTimeSlots('', '10:00')).toEqual([]);
      expect(generateTimeSlots('09:00', '')).toEqual([]);
      expect(generateTimeSlots('', '')).toEqual([]);
    });

    it('should handle minimum 5-minute range', () => {
      const slots = generateTimeSlots('12:00', '12:05');
      expect(slots).toEqual(['12:00']);
    });

    it('should pad hours and minutes with leading zeros', () => {
      const slots = generateTimeSlots('08:05', '08:15');
      expect(slots).toEqual(['08:05', '08:10']);
    });
  });

  describe('validateTimeRange', () => {
    it('should validate a valid time range', () => {
      const result = validateTimeRange('09:00', '10:00');
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject range less than 5 minutes', () => {
      const result = validateTimeRange('09:00', '09:03');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Time range must be at least 5 minutes');
    });

    it('should reject range exceeding 1 hour', () => {
      const result = validateTimeRange('09:00', '10:05');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Time range cannot exceed 1 hour');
    });

    it('should accept exactly 5 minutes', () => {
      const result = validateTimeRange('14:00', '14:05');
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should accept exactly 60 minutes', () => {
      const result = validateTimeRange('11:00', '12:00');
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject if start time is missing', () => {
      const result = validateTimeRange('', '10:00');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Both start and end times are required');
    });

    it('should reject if end time is missing', () => {
      const result = validateTimeRange('09:00', '');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Both start and end times are required');
    });

    it('should reject if both times are missing', () => {
      const result = validateTimeRange('', '');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Both start and end times are required');
    });

    it('should handle negative duration (end before start)', () => {
      const result = validateTimeRange('10:00', '09:00');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Time range must be at least 5 minutes');
    });
  });

  describe('roundToNearestFiveMinutes', () => {
    it('should round down when closer to lower interval', () => {
      expect(roundToNearestFiveMinutes('09:01')).toBe('09:00');
      expect(roundToNearestFiveMinutes('09:02')).toBe('09:00');
    });

    it('should round up when closer to upper interval', () => {
      expect(roundToNearestFiveMinutes('09:03')).toBe('09:05');
      expect(roundToNearestFiveMinutes('09:04')).toBe('09:05');
    });

    it('should keep times already on 5-minute intervals', () => {
      expect(roundToNearestFiveMinutes('09:00')).toBe('09:00');
      expect(roundToNearestFiveMinutes('09:05')).toBe('09:05');
      expect(roundToNearestFiveMinutes('09:15')).toBe('09:15');
    });

    it('should handle rounding to next hour', () => {
      expect(roundToNearestFiveMinutes('09:58')).toBe('10:00');
      expect(roundToNearestFiveMinutes('09:59')).toBe('10:00');
    });

    it('should handle single-digit hours', () => {
      expect(roundToNearestFiveMinutes('08:07')).toBe('08:05');
      expect(roundToNearestFiveMinutes('08:08')).toBe('08:10');
    });

    it('should return empty string for empty input', () => {
      expect(roundToNearestFiveMinutes('')).toBe('');
    });

    it('should pad hours with leading zero', () => {
      expect(roundToNearestFiveMinutes('08:58')).toBe('09:00');
    });
  });
});
