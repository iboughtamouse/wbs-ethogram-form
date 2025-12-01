import {
  formatTo12Hour,
  generateTimeSlots,
  validateTimeRange,
  roundToNearestFiveMinutes,
  formatMinutesToLabel,
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
    it('should generate 5-minute intervals within range including end time', () => {
      const slots = generateTimeSlots('09:00', '09:30');
      expect(slots).toEqual([
        '09:00',
        '09:05',
        '09:10',
        '09:15',
        '09:20',
        '09:25',
        '09:30',
      ]);
    });

    it('should generate slots for a full hour including end time', () => {
      const slots = generateTimeSlots('14:00', '15:00');
      expect(slots).toHaveLength(13);
      expect(slots[0]).toBe('14:00');
      expect(slots[12]).toBe('15:00');
    });

    it('should include the end time as final slot', () => {
      const slots = generateTimeSlots('10:00', '10:15');
      expect(slots).toEqual(['10:00', '10:05', '10:10', '10:15']);
    });

    it('should handle cross-hour boundaries including end time', () => {
      const slots = generateTimeSlots('09:50', '10:10');
      expect(slots).toEqual(['09:50', '09:55', '10:00', '10:05', '10:10']);
    });

    it('should return empty array if start or end is missing', () => {
      expect(generateTimeSlots('', '10:00')).toEqual([]);
      expect(generateTimeSlots('09:00', '')).toEqual([]);
      expect(generateTimeSlots('', '')).toEqual([]);
    });

    it('should handle minimum 5-minute range', () => {
      const slots = generateTimeSlots('12:00', '12:05');
      expect(slots).toEqual(['12:00', '12:05']);
    });

    it('should pad hours and minutes with leading zeros', () => {
      const slots = generateTimeSlots('08:05', '08:15');
      expect(slots).toEqual(['08:05', '08:10', '08:15']);
    });

    it('should include end time for the reported issue (2:45-3:35)', () => {
      const slots = generateTimeSlots('14:45', '15:35');
      expect(slots).toHaveLength(11); // 10 intervals of 5 min + end time = 11 slots
      expect(slots[0]).toBe('14:45');
      expect(slots[10]).toBe('15:35');
      expect(slots).toContain('15:35');
    });

    it('should handle midnight crossing (23:55 to 00:00)', () => {
      const slots = generateTimeSlots('23:55', '00:00');
      expect(slots).toEqual(['23:55', '00:00']);
    });

    it('should handle midnight crossing (23:50 to 00:10)', () => {
      const slots = generateTimeSlots('23:50', '00:10');
      expect(slots).toEqual(['23:50', '23:55', '00:00', '00:05', '00:10']);
    });

    it('should handle midnight crossing with full hour (23:30 to 00:30)', () => {
      const slots = generateTimeSlots('23:30', '00:30');
      expect(slots).toHaveLength(13); // 60 minutes / 5 + 1 = 13 slots
      expect(slots[0]).toBe('23:30');
      expect(slots[6]).toBe('00:00'); // Midnight at index 6
      expect(slots[12]).toBe('00:30');
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

    it('should accept midnight crossing (23:55 to 00:00)', () => {
      const result = validateTimeRange('23:55', '00:00');
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should accept midnight crossing (23:30 to 00:30)', () => {
      const result = validateTimeRange('23:30', '00:30');
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject midnight crossing exceeding 1 hour (23:00 to 00:05)', () => {
      const result = validateTimeRange('23:00', '00:05');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Time range cannot exceed 1 hour');
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

  describe('formatMinutesToLabel', () => {
    it('should format 60 minutes as 1 hour', () => {
      expect(formatMinutesToLabel(60)).toBe('1 hour');
    });

    it('should format 120 minutes as 2 hours', () => {
      expect(formatMinutesToLabel(120)).toBe('2 hours');
    });

    it('should format other minute values as minutes', () => {
      expect(formatMinutesToLabel(5)).toBe('5 minutes');
      expect(formatMinutesToLabel(15)).toBe('15 minutes');
    });
  });
});
