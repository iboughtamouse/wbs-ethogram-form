import { isValidISODate, validateDate } from '../dateValidator';

describe('dateValidator', () => {
  it('accepts a valid date string in YYYY-MM-DD format', () => {
    expect(isValidISODate('2025-11-22')).toBe(true);
    expect(validateDate('2025-11-22')).toBe('');
  });

  it('rejects invalid format like 11/22/2025', () => {
    expect(isValidISODate('11/22/2025')).toBe(false);
    expect(validateDate('11/22/2025')).toBe('Date must be a valid YYYY-MM-DD');
  });

  it('rejects malformed date strings like 99/99/9999', () => {
    expect(isValidISODate('99/99/9999')).toBe(false);
    expect(validateDate('99/99/9999')).toBe('Date must be a valid YYYY-MM-DD');
  });

  it('rejects out-of-range month/day values', () => {
    expect(isValidISODate('2025-13-01')).toBe(false);
    expect(validateDate('2025-13-01')).toBe('Date must be a valid YYYY-MM-DD');
    expect(isValidISODate('2025-01-32')).toBe(false);
    expect(validateDate('2025-01-32')).toBe('Date must be a valid YYYY-MM-DD');
  });

  it('rejects zero month or zero day values', () => {
    expect(isValidISODate('2025-00-15')).toBe(false);
    expect(validateDate('2025-00-15')).toBe('Date must be a valid YYYY-MM-DD');
    expect(isValidISODate('2025-01-00')).toBe(false);
    expect(validateDate('2025-01-00')).toBe('Date must be a valid YYYY-MM-DD');
  });

  it('validates leap year dates correctly', () => {
    // 2024 is a leap year
    expect(isValidISODate('2024-02-29')).toBe(true);
    expect(validateDate('2024-02-29')).toBe('');

    // 2023 is not a leap year
    expect(isValidISODate('2023-02-29')).toBe(false);
    expect(validateDate('2023-02-29')).toBe('Date must be a valid YYYY-MM-DD');
  });

  it('rejects out-of-range months and days (format correct but values invalid)', () => {
    expect(isValidISODate('2025-13-01')).toBe(false); // month > 12
    expect(isValidISODate('2025-01-32')).toBe(false); // day > 31
    expect(isValidISODate('2025-00-15')).toBe(false); // zero month
    expect(isValidISODate('2025-01-00')).toBe(false); // zero day
    expect(validateDate('2025-13-01')).toBe('Date must be a valid YYYY-MM-DD');
    expect(validateDate('2025-01-32')).toBe('Date must be a valid YYYY-MM-DD');
  });

  it('validates leap year dates properly', () => {
    expect(isValidISODate('2024-02-29')).toBe(true); // 2024 is a leap year
    expect(isValidISODate('2023-02-29')).toBe(false); // 2023 is not a leap year
    expect(validateDate('2024-02-29')).toBe('');
    expect(validateDate('2023-02-29')).toBe('Date must be a valid YYYY-MM-DD');
  });

  it('rejects impossible calendar dates (2025-02-30)', () => {
    expect(isValidISODate('2025-02-30')).toBe(false);
    expect(validateDate('2025-02-30')).toBe('Date must be a valid YYYY-MM-DD');
  });

  it('rejects empty or blank strings', () => {
    expect(isValidISODate('')).toBe(false);
    expect(validateDate('')).toBe('Date is required');
  });
});
