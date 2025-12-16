import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../src/App';
import * as localStorageUtils from '../../src/utils/localStorageUtils';
import * as timezoneUtils from '../../src/utils/timezoneUtils';
import { requiresLocation } from '../../src/constants/behaviors';

// Mock localStorage utilities
jest.mock('../../src/utils/localStorageUtils');

// Mock timezone utilities to make tests deterministic
jest.mock('../../src/utils/timezoneUtils', () => ({
  convertToWBSTime: jest.fn((date, time) => time),
  getUserTimezone: jest.fn(() => 'America/New_York'),
  WBS_TIMEZONE: 'America/Chicago',
}));

describe('Time range adjustment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageUtils.hasDraft.mockReturnValue(false);
    localStorageUtils.loadDraft.mockReturnValue(null);
    localStorageUtils.saveDraft.mockReturnValue(true);
    localStorageUtils.clearDraft.mockReturnValue(true);
  });

  // Helper to fill observation - uses constants helper to determine if location is needed
  const fillObservation = async (timeSlotText, behavior, location) => {
    const slot = screen.getByText(timeSlotText).closest('.time-slot');
    const behaviorSelect = within(slot).getAllByRole('combobox')[0];
    fireEvent.change(behaviorSelect, { target: { value: behavior } });

    // If behavior requires location, wait for field to appear and fill it
    if (requiresLocation(behavior) && location) {
      await waitFor(() => {
        const locationSelects = within(slot).getAllByRole('combobox');
        expect(locationSelects.length).toBeGreaterThan(1);
      });
      const locationInput = within(slot).getAllByRole('combobox')[1];
      fireEvent.change(locationInput, { target: { value: location } });
    }
  };

  test('preserves observation data when adjusting time range through invalid intermediate state', async () => {
    render(<App />);

    const timeRangeContainer = screen
      .getByText(/Observation Time Range/i)
      .closest('.form-group');
    const timeInputs =
      timeRangeContainer.querySelectorAll('input[type="time"]');
    const startTimeInput = timeInputs[0];
    const endTimeInput = timeInputs[1];

    // Setup: Create initial range with observations
    fireEvent.change(startTimeInput, { target: { value: '09:35' } });
    fireEvent.blur(startTimeInput);
    fireEvent.change(endTimeInput, { target: { value: '10:30' } });
    fireEvent.blur(endTimeInput);

    await waitFor(() => {
      expect(screen.getByText('9:35 AM')).toBeInTheDocument();
    });

    // Fill observations - use simple behavior that doesn't require location
    await fillObservation('9:35 AM', 'drinking');
    await fillObservation('9:40 AM', 'bathing');
    await fillObservation('9:45 AM', 'vocalizing');
    await fillObservation('9:50 AM', 'drinking');

    // Verify data is filled
    const slot1 = screen.getByText('9:35 AM').closest('.time-slot');
    expect(within(slot1).getAllByRole('combobox')[0].value).toBe('drinking');

    // Core bug test: Change range through invalid intermediate state
    // When changing 10:30 → 9:50, intermediate state is 9:35 - 9:30 (invalid)
    fireEvent.change(endTimeInput, { target: { value: '09:50' } });
    fireEvent.blur(endTimeInput);

    // Fix verification: Observations should be preserved, slots regenerated
    await waitFor(() => {
      expect(screen.getByText('9:50 AM')).toBeInTheDocument();
    });

    expect(
      within(screen.getByText('9:35 AM').closest('.time-slot')).getAllByRole(
        'combobox'
      )[0].value
    ).toBe('drinking');
    expect(
      within(screen.getByText('9:40 AM').closest('.time-slot')).getAllByRole(
        'combobox'
      )[0].value
    ).toBe('bathing');
    expect(
      within(screen.getByText('9:45 AM').closest('.time-slot')).getAllByRole(
        'combobox'
      )[0].value
    ).toBe('vocalizing');
    expect(
      within(screen.getByText('9:50 AM').closest('.time-slot')).getAllByRole(
        'combobox'
      )[0].value
    ).toBe('drinking');
  });
});
