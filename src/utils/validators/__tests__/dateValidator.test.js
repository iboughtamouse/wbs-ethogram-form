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

  it('rejects impossible calendar dates (2025-02-30)', () => {
    expect(isValidISODate('2025-02-30')).toBe(false);
    expect(validateDate('2025-02-30')).toBe('Date must be a valid YYYY-MM-DD');
  });

  it('rejects empty or blank strings', () => {
    expect(isValidISODate('')).toBe(false);
    expect(validateDate('')).toBe('Date is required');
  });
});
