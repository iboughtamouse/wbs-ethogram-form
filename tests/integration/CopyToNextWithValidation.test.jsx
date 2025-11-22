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

// Mock localStorage utilities
jest.mock('../../src/utils/localStorageUtils');

describe('Copy to Next with Validation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageUtils.hasDraft.mockReturnValue(false);
    localStorageUtils.loadDraft.mockReturnValue(null);
    localStorageUtils.saveDraft.mockReturnValue(true);
    localStorageUtils.clearDraft.mockReturnValue(true);
  });

  const setupTimeSlots = async () => {
    render(<App />);

    const container = screen
      .getByText('Observation Time Range')
      .closest('.form-group');
    const timeInputs = container.querySelectorAll('input[type="time"]');

    fireEvent.change(timeInputs[0], { target: { value: '10:00' } });
    fireEvent.change(timeInputs[1], { target: { value: '10:10' } });

    await waitFor(() => {
      expect(screen.getByText('10:00 AM')).toBeInTheDocument();
    });
  };

  test('prevents copy when behavior is not selected', async () => {
    await setupTimeSlots();

    const firstSlot = screen.getByText('10:00 AM').closest('.time-slot');
    const copyButton = within(firstSlot).getByRole('button', {
      name: /copy to next/i,
    });

    // Click copy without selecting behavior
    fireEvent.click(copyButton);

    // Should show validation error
    await waitFor(() => {
      expect(
        within(firstSlot).getByText(/please select a behavior/i)
      ).toBeInTheDocument();
    });

    // Second slot should remain empty
    const secondSlot = screen.getByText('10:05 AM').closest('.time-slot');
    const secondSlotBehavior = within(secondSlot).getAllByRole('combobox')[0];
    expect(secondSlotBehavior.value).toBe('');
  });

  test('allows copy when behavior is selected (no additional fields required)', async () => {
    await setupTimeSlots();

    const firstSlot = screen.getByText('10:00 AM').closest('.time-slot');
    const behaviorSelect = within(firstSlot).getAllByRole('combobox')[0];
    const copyButton = within(firstSlot).getByRole('button', {
      name: /copy to next/i,
    });

    // Select a behavior that doesn't require additional fields
    fireEvent.change(behaviorSelect, { target: { value: 'drinking' } });

    await waitFor(() => {
      expect(behaviorSelect.value).toBe('drinking');
    });

    // Click copy - should succeed
    fireEvent.click(copyButton);

    // Second slot should have the same behavior
    await waitFor(() => {
      const secondSlot = screen.getByText('10:05 AM').closest('.time-slot');
      const secondSlotBehavior = within(secondSlot).getAllByRole('combobox')[0];
      expect(secondSlotBehavior.value).toBe('drinking');
    });
  });

  test('prevents copy when required description is missing', async () => {
    await setupTimeSlots();

    const firstSlot = screen.getByText('10:00 AM').closest('.time-slot');
    const behaviorSelect = within(firstSlot).getAllByRole('combobox')[0];
    const copyButton = within(firstSlot).getByRole('button', {
      name: /copy to next/i,
    });

    // Select "other" behavior which requires description
    fireEvent.change(behaviorSelect, { target: { value: 'other' } });

    await waitFor(() => {
      expect(behaviorSelect.value).toBe('other');
    });

    // Click copy without filling description
    fireEvent.click(copyButton);

    // Should show validation error
    await waitFor(() => {
      expect(
        within(firstSlot).getByText(
          /description is required for this behavior/i
        )
      ).toBeInTheDocument();
    });

    // Second slot should remain empty
    const secondSlot = screen.getByText('10:05 AM').closest('.time-slot');
    const secondSlotBehavior = within(secondSlot).getAllByRole('combobox')[0];
    expect(secondSlotBehavior.value).toBe('');
  });

  test('allows copy when required description is filled', async () => {
    await setupTimeSlots();

    const firstSlot = screen.getByText('10:00 AM').closest('.time-slot');
    const behaviorSelect = within(firstSlot).getAllByRole('combobox')[0];
    const copyButton = within(firstSlot).getByRole('button', {
      name: /copy to next/i,
    });

    // Select "other" behavior which requires description
    fireEvent.change(behaviorSelect, { target: { value: 'other' } });

    await waitFor(() => {
      expect(behaviorSelect.value).toBe('other');
      expect(
        within(firstSlot).getByPlaceholderText(/describe the behavior/i)
      ).toBeInTheDocument();
    });

    // Fill description
    const descriptionInput = within(firstSlot).getByPlaceholderText(
      /describe the behavior/i
    );
    fireEvent.change(descriptionInput, {
      target: { value: 'Custom behavior description' },
    });

    await waitFor(() => {
      expect(descriptionInput.value).toBe('Custom behavior description');
    });

    // Click copy - should succeed
    fireEvent.click(copyButton);

    // Second slot should have the same behavior and description
    await waitFor(() => {
      const secondSlot = screen.getByText('10:05 AM').closest('.time-slot');
      const secondSlotBehavior = within(secondSlot).getAllByRole('combobox')[0];
      expect(secondSlotBehavior.value).toBe('other');

      const secondSlotDescription = within(secondSlot).getByPlaceholderText(
        /describe the behavior/i
      );
      expect(secondSlotDescription.value).toBe('Custom behavior description');
    });
  });

  test('prevents copy when object is required but not selected', async () => {
    await setupTimeSlots();

    const firstSlot = screen.getByText('10:00 AM').closest('.time-slot');
    const behaviorSelect = within(firstSlot).getAllByRole('combobox')[0];
    const copyButton = within(firstSlot).getByRole('button', {
      name: /copy to next/i,
    });

    // Select behavior that requires object
    fireEvent.change(behaviorSelect, {
      target: { value: 'interacting_object' },
    });

    // Wait for behavior to be set
    await waitFor(() => {
      expect(behaviorSelect.value).toBe('interacting_object');
    });

    // Click copy without selecting object
    fireEvent.click(copyButton);

    // Should show validation error
    await waitFor(() => {
      expect(
        within(firstSlot).getByText(/object is required/i)
      ).toBeInTheDocument();
    });

    // Second slot should remain empty
    const secondSlot = screen.getByText('10:05 AM').closest('.time-slot');
    const secondSlotBehavior = within(secondSlot).getAllByRole('combobox')[0];
    expect(secondSlotBehavior.value).toBe('');
  });
});
