/**
 * Date validator utility
 *
 * Ensures input is a valid ISO date (YYYY-MM-DD), exists, and resolves to the same
 * calendar date when parsed by the JS Date object. This avoids JS Date normalization
 * accepting `2025-02-30` as a valid date and normalizing it to 2025-03-02.
 */
export function isValidISODate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  // Strict YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const parts = dateStr.split('-').map(Number);
  const [year, month, day] = parts;
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day))
    return false;

  // Create a UTC Date so local timezone doesn't change the day
  const dt = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(dt.getTime())) return false;

  return (
    dt.getUTCFullYear() === year &&
    dt.getUTCMonth() + 1 === month &&
    dt.getUTCDate() === day
  );
}

export function validateDate(dateStr) {
  if (!dateStr) return 'Date is required';
  if (!isValidISODate(dateStr)) return 'Date must be a valid YYYY-MM-DD';

  // Optionally enforce same server constraints here if desired (2024-01-01..today+1)
  // We'll leave stricter range checks to server validation; keep client-side simple.
  return '';
}

export default validateDate;
