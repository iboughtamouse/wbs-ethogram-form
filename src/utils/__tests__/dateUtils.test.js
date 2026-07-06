import { getTodayWBS } from '../dateUtils';

describe('getTodayWBS', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  const freeze = (iso) => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(iso));
  };

  it('returns a YYYY-MM-DD string', () => {
    freeze('2026-03-15T15:00:00Z'); // midday UTC, no date rollover
    expect(getTodayWBS()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(getTodayWBS()).toBe('2026-03-15');
  });

  it('returns the WBS-timezone date, not the UTC date, after ~7pm Central (summer/CDT)', () => {
    // 02:30 UTC on Jul 6 is still 21:30 (9:30pm) on Jul 5 in Central time (UTC-5).
    // The old UTC-based default returned '2026-07-06' here — the bug.
    freeze('2026-07-06T02:30:00Z');
    expect(getTodayWBS()).toBe('2026-07-05');
  });

  it('handles standard time correctly (winter/CST)', () => {
    // 04:30 UTC on Jan 6 is 22:30 (10:30pm) on Jan 5 in Central time (UTC-6).
    freeze('2026-01-06T04:30:00Z');
    expect(getTodayWBS()).toBe('2026-01-05');
  });

  it('agrees with the UTC date during Central daytime', () => {
    freeze('2026-07-05T18:00:00Z'); // 1pm Central — same calendar day in both zones
    expect(getTodayWBS()).toBe('2026-07-05');
  });
});
