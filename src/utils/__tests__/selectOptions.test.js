import { withCurrentValue, withCurrentGroupedValue } from '../selectOptions';

const OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

describe('withCurrentValue (keep-listed rule)', () => {
  it('returns options unchanged when the value is present', () => {
    expect(withCurrentValue(OPTIONS, 'a')).toBe(OPTIONS);
  });

  it('returns options unchanged for an empty value', () => {
    expect(withCurrentValue(OPTIONS, '')).toBe(OPTIONS);
  });

  it('injects a disabled entry for an out-of-menu value', () => {
    const result = withCurrentValue(OPTIONS, 'gone', () => 'Gone Label');
    expect(result).toHaveLength(4);
    expect(result[3]).toEqual({
      value: 'gone',
      label: 'Gone Label (retired)',
      disabled: true,
    });
  });

  it('falls back to the raw value when no label resolves', () => {
    const result = withCurrentValue(OPTIONS, 'mystery', () => undefined);
    expect(result[3].label).toBe('mystery (retired)');
  });
});

describe('withCurrentGroupedValue (location keep-listed rule)', () => {
  const GROUPS = [
    { label: 'Perches', options: [{ value: '1', label: 'Perch 1' }] },
    { label: 'Other', options: [{ value: 'W', label: 'W - Water Bowl' }] },
  ];

  it('returns groups unchanged when the value is present in any group', () => {
    expect(withCurrentGroupedValue(GROUPS, 'W')).toBe(GROUPS);
  });

  it('returns groups unchanged for an empty value', () => {
    expect(withCurrentGroupedValue(GROUPS, '')).toBe(GROUPS);
  });

  it('appends a Retired group for an out-of-menu value', () => {
    const result = withCurrentGroupedValue(GROUPS, 'BB9');
    expect(result).toHaveLength(3);
    expect(result[2]).toEqual({
      label: 'Retired',
      options: [{ value: 'BB9', label: 'BB9 (retired)' }],
    });
  });
});
