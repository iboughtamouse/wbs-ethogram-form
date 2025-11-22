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

// Mock localStorage utilities
jest.mock('../../src/utils/localStorageUtils');

// Mock timezone utilities to make tests deterministic
jest.mock('../../src/utils/timezoneUtils', () => ({
  convertToWBSTime: jest.fn((date, time) => time), // No conversion in tests
  getUserTimezone: jest.fn(() => 'America/New_York'),
  WBS_TIMEZONE: 'America/Chicago',
}));

describe('App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations
    localStorageUtils.hasDraft.mockReturnValue(false);
    localStorageUtils.loadDraft.mockReturnValue(null);
    localStorageUtils.saveDraft.mockReturnValue(true);
    localStorageUtils.clearDraft.mockReturnValue(true);
  });

  // Helper function to fill in metadata completely
  const fillMetadata = async (observerName = 'TestObserver') => {
    const observerInput = screen.getByPlaceholderText(
      /Enter your Discord username/i
    );
    fireEvent.change(observerInput, { target: { value: observerName } });

    // Date is pre-filled with today by default, so we're good
    // (The App component initializes it with today's date)
  };

  // Helper function to fill a time slot with a simple behavior (no additional fields required)
  const fillTimeSlot = async (timeSlotText, behavior = 'drinking') => {
    await waitFor(() => {
      expect(screen.getByText(timeSlotText)).toBeInTheDocument();
    });

    const slot = screen.getByText(timeSlotText).closest('.time-slot');
    const behaviorSelects = within(slot).getAllByRole('combobox');
    const behaviorSelect = behaviorSelects[0]; // First select is always behavior
    fireEvent.change(behaviorSelect, { target: { value: behavior } });
  };

  describe('Time Slot Generation', () => {
    test('generates correct time slots when valid time range is entered', async () => {
      render(<App />);

      // Fill in metadata to create time slots
      const container = screen
        .getByText('Observation Time Range')
        .closest('.form-group');
      const timeInputs = container.querySelectorAll('input[type="time"]');

      fireEvent.change(timeInputs[0], { target: { value: '10:00' } });
      fireEvent.change(timeInputs[1], { target: { value: '10:20' } });

      // Should generate 5 slots: 10:00, 10:05, 10:10, 10:15, 10:20
      await waitFor(() => {
        expect(screen.getByText('10:00 AM')).toBeInTheDocument();
      });
      expect(screen.getByText('10:05 AM')).toBeInTheDocument();
      expect(screen.getByText('10:10 AM')).toBeInTheDocument();
      expect(screen.getByText('10:15 AM')).toBeInTheDocument();
      expect(screen.getByText('10:20 AM')).toBeInTheDocument();
    });

    test('clears time slots when time range becomes invalid', async () => {
      render(<App />);

      const container = screen
        .getByText('Observation Time Range')
        .closest('.form-group');
      const timeInputs = container.querySelectorAll('input[type="time"]');

      // First create valid slots
      fireEvent.change(timeInputs[0], { target: { value: '10:00' } });
      fireEvent.change(timeInputs[1], { target: { value: '10:20' } });

      await waitFor(() => {
        expect(screen.getByText('10:00 AM')).toBeInTheDocument();
      });

      // Now make range invalid (end before start)
      fireEvent.change(timeInputs[1], { target: { value: '09:00' } });

      // Slots should be cleared - only the helper text should remain
      await waitFor(() => {
        expect(screen.queryByText('10:00 AM')).not.toBeInTheDocument();
      });
      expect(
        screen.getByText(/Please select a time range above/i)
      ).toBeInTheDocument();
    });

    test('preserves observation data when time range is extended', async () => {
      render(<App />);

      const container = screen
        .getByText('Observation Time Range')
        .closest('.form-group');
      const timeInputs = container.querySelectorAll('input[type="time"]');

      // Create initial slots
      fireEvent.change(timeInputs[0], { target: { value: '10:00' } });
      fireEvent.change(timeInputs[1], { target: { value: '10:10' } });

      // Wait for slots to be created
      await waitFor(() => {
        expect(screen.getByText('10:00 AM')).toBeInTheDocument();
      });

      // Fill in observation for 10:00
      const firstSlot = screen.getByText('10:00 AM').closest('.time-slot');
      const behaviorSelect = within(firstSlot).getByRole('combobox');
      fireEvent.change(behaviorSelect, { target: { value: 'preening' } });

      // Extend time range
      fireEvent.change(timeInputs[1], { target: { value: '10:20' } });

      // Wait for new slots to be added and DOM to stabilize
      await waitFor(() => {
        expect(screen.getByText('10:20 AM')).toBeInTheDocument();
        expect(screen.getByText('10:15 AM')).toBeInTheDocument();
      });

      // Original data should still be present
      const updatedFirstSlot = screen
        .getByText('10:00 AM')
        .closest('.time-slot');
      const allComboboxes = within(updatedFirstSlot).getAllByRole('combobox');
      const updatedBehaviorSelect = allComboboxes[0]; // First combobox is always behavior
      expect(updatedBehaviorSelect).toHaveValue('preening');
    });
  });

  describe('Metadata State Management', () => {
    test('updates metadata state when observer name changes', () => {
      render(<App />);

      const observerInput = screen.getByPlaceholderText(
        /Enter your Discord username/i
      );
      fireEvent.change(observerInput, { target: { value: 'TestObserver' } });

      expect(observerInput).toHaveValue('TestObserver');
    });

    test('updates metadata state when date changes', () => {
      render(<App />);

      // Find date input by getting today's date value
      const dateInput = screen.getAllByDisplayValue(/2025-\d{2}-\d{2}/)[0];
      fireEvent.change(dateInput, { target: { value: '2025-12-25' } });

      expect(dateInput).toHaveValue('2025-12-25');
    });

    test('updates metadata state when mode changes', () => {
      render(<App />);

      const vodRadio = screen.getByRole('radio', { name: /Recorded Video/i });
      fireEvent.click(vodRadio);

      expect(vodRadio).toBeChecked();
      // VOD mode should show different help text
      expect(
        screen.getByText(/Enter times exactly as shown on stream/i)
      ).toBeInTheDocument();
    });
  });

  describe('Observation State Management', () => {
    test('updates observation state when behavior changes', async () => {
      render(<App />);

      // Create time slots
      const container = screen
        .getByText('Observation Time Range')
        .closest('.form-group');
      const timeInputs = container.querySelectorAll('input[type="time"]');
      fireEvent.change(timeInputs[0], { target: { value: '10:00' } });
      fireEvent.change(timeInputs[1], { target: { value: '10:05' } });

      // Wait for slots to be created
      await waitFor(() => {
        expect(screen.getByText('10:00 AM')).toBeInTheDocument();
      });

      // Change behavior in first slot
      const firstSlot = screen.getByText('10:00 AM').closest('.time-slot');
      const behaviorSelect = within(firstSlot).getByRole('combobox');
      fireEvent.change(behaviorSelect, { target: { value: 'preening' } });

      expect(behaviorSelect).toHaveValue('preening');
    });

    test('clears dependent fields when behavior changes', async () => {
      render(<App />);

      // Create time slots
      const container = screen
        .getByText('Observation Time Range')
        .closest('.form-group');
      const timeInputs = container.querySelectorAll('input[type="time"]');
      fireEvent.change(timeInputs[0], { target: { value: '10:00' } });
      fireEvent.change(timeInputs[1], { target: { value: '10:05' } });

      // Wait for slots to be created
      await waitFor(() => {
        expect(screen.getByText('10:00 AM')).toBeInTheDocument();
      });

      // Select aggression behavior (which requires description)
      const firstSlot = screen.getByText('10:00 AM').closest('.time-slot');
      const behaviorSelect = within(firstSlot).getAllByRole('combobox')[0];
      fireEvent.change(behaviorSelect, { target: { value: 'aggression' } });

      // Wait for description field to appear
      await waitFor(() => {
        expect(
          within(firstSlot).getByPlaceholderText(/Describe the behavior/i)
        ).toBeInTheDocument();
      });

      // Fill in description
      const descriptionInput = within(firstSlot).getByPlaceholderText(
        /Describe the behavior/i
      );
      fireEvent.change(descriptionInput, {
        target: { value: 'Test description' },
      });
      expect(descriptionInput).toHaveValue('Test description');

      // Change behavior to something that doesn't require description
      fireEvent.change(behaviorSelect, { target: { value: 'preening' } });

      // Description field should no longer exist
      await waitFor(() => {
        expect(
          within(firstSlot).queryByPlaceholderText(/Describe the behavior/i)
        ).not.toBeInTheDocument();
      });
    });

    test('clears "other" text when dropdown changes away from "other"', async () => {
      render(<App />);

      // Create time slots
      const container = screen
        .getByText('Observation Time Range')
        .closest('.form-group');
      const timeInputs = container.querySelectorAll('input[type="time"]');
      fireEvent.change(timeInputs[0], { target: { value: '10:00' } });
      fireEvent.change(timeInputs[1], { target: { value: '10:05' } });

      // Wait for slots to be created
      await waitFor(() => {
        expect(screen.getByText('10:00 AM')).toBeInTheDocument();
      });

      // Select interaction behavior
      const firstSlot = screen.getByText('10:00 AM').closest('.time-slot');
      const behaviorSelect = within(firstSlot).getByRole('combobox');
      fireEvent.change(behaviorSelect, {
        target: { value: 'interacting_object' },
      });

      // Wait for conditional fields to appear
      await waitFor(() => {
        const allSelects = within(firstSlot).getAllByRole('combobox');
        expect(allSelects.length).toBeGreaterThan(1);
      });

      // Select "other" for object
      const allSelects = within(firstSlot).getAllByRole('combobox');
      const objectSelect = allSelects[1];
      fireEvent.change(objectSelect, { target: { value: 'other' } });

      // Wait for "other" input to appear
      await waitFor(() => {
        expect(
          within(firstSlot).getByPlaceholderText(/Enter object name/i)
        ).toBeInTheDocument();
      });

      // Fill in "other" text
      const otherInput =
        within(firstSlot).getByPlaceholderText(/Enter object name/i);
      fireEvent.change(otherInput, { target: { value: 'custom object' } });
      expect(otherInput).toHaveValue('custom object');

      // Change away from "other"
      fireEvent.change(objectSelect, { target: { value: 'newspaper' } });

      // "Other" text should be cleared and input should disappear
      await waitFor(() => {
        expect(
          within(firstSlot).queryByPlaceholderText(/Enter object name/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Copy to Next Slot', () => {
    test('copies observation data to next time slot', async () => {
      render(<App />);

      // Create time slots
      const container = screen
        .getByText('Observation Time Range')
        .closest('.form-group');
      const timeInputs = container.querySelectorAll('input[type="time"]');
      fireEvent.change(timeInputs[0], { target: { value: '10:00' } });
      fireEvent.change(timeInputs[1], { target: { value: '10:10' } });

      // Wait for slots to be created
      await waitFor(() => {
        expect(screen.getByText('10:00 AM')).toBeInTheDocument();
      });

      // Fill in first slot with a simple behavior (no additional fields)
      const firstSlot = screen.getByText('10:00 AM').closest('.time-slot');
      const behaviorSelects = within(firstSlot).getAllByRole('combobox');
      const behaviorSelect = behaviorSelects[0]; // First select is always behavior
      fireEvent.change(behaviorSelect, { target: { value: 'drinking' } });

      // Click copy button
      const copyButton = within(firstSlot).getByText(/Copy to next/i);
      fireEvent.click(copyButton);

      // Second slot should have the same behavior
      await waitFor(() => {
        const secondSlot = screen.getByText('10:05 AM').closest('.time-slot');
        const secondBehaviorSelects =
          within(secondSlot).getAllByRole('combobox');
        const secondBehaviorSelect = secondBehaviorSelects[0];
        expect(secondBehaviorSelect).toHaveValue('drinking');
      });
    });

    test('copy button does not appear on last slot', async () => {
      render(<App />);

      // Create time slots
      const container = screen
        .getByText('Observation Time Range')
        .closest('.form-group');
      const timeInputs = container.querySelectorAll('input[type="time"]');
      fireEvent.change(timeInputs[0], { target: { value: '10:00' } });
      fireEvent.change(timeInputs[1], { target: { value: '10:10' } });

      // Wait for slots to be created
      await waitFor(() => {
        expect(screen.getByText('10:10 AM')).toBeInTheDocument();
      });

      // Last slot should not have copy button
      const lastSlot = screen.getByText('10:10 AM').closest('.time-slot');
      expect(
        within(lastSlot).queryByText(/Copy to next/i)
      ).not.toBeInTheDocument();
    });
  });

  describe('Form Submission and Validation', () => {
    test('prevents submission and shows errors when form is invalid', async () => {
      render(<App />);

      // Create time slots but don't fill required fields
      const container = screen
        .getByText('Observation Time Range')
        .closest('.form-group');
      const timeInputs = container.querySelectorAll('input[type="time"]');
      fireEvent.change(timeInputs[0], { target: { value: '10:00' } });
      fireEvent.change(timeInputs[1], { target: { value: '10:05' } });

      // Wait for slots to be created
      await waitFor(() => {
        expect(screen.getByText('10:00 AM')).toBeInTheDocument();
      });

      // Try to submit without filling required fields
      const submitButton = screen.getByText(/Validate & Preview/i);
      fireEvent.click(submitButton);

      // Should show validation errors (check for actual error message)
      await waitFor(() => {
        expect(
          screen.getByText(/Discord username is required/i)
        ).toBeInTheDocument();
      });

      // Output preview should not appear
      expect(screen.queryByText(/Data Preview/i)).not.toBeInTheDocument();
    });

    test('shows output preview when form is valid', async () => {
      render(<App />);

      // Fill in all required metadata
      await fillMetadata('TestObserver');

      const container = screen
        .getByText('Observation Time Range')
        .closest('.form-group');
      const timeInputs = container.querySelectorAll('input[type="time"]');
      fireEvent.change(timeInputs[0], { target: { value: '10:00' } });
      fireEvent.change(timeInputs[1], { target: { value: '10:05' } });

      // Fill in ALL observation slots (both need behaviors selected)
      await fillTimeSlot('10:00 AM', 'drinking');
      await fillTimeSlot('10:05 AM', 'drinking');

      // Submit form
      const submitButton = screen.getByText(/Validate & Preview/i);
      fireEvent.click(submitButton);

      // Output preview should appear
      await waitFor(() => {
        expect(screen.getByText(/Data Preview/i)).toBeInTheDocument();
      });
    });

    test('generates correct output structure with metadata and observations', async () => {
      render(<App />);

      // Fill in metadata
      await fillMetadata('TestObserver');

      const container = screen
        .getByText('Observation Time Range')
        .closest('.form-group');
      const timeInputs = container.querySelectorAll('input[type="time"]');
      fireEvent.change(timeInputs[0], { target: { value: '10:00' } });
      fireEvent.change(timeInputs[1], { target: { value: '10:05' } });

      // Fill in ALL observation slots
      await fillTimeSlot('10:00 AM', 'drinking');
      await fillTimeSlot('10:05 AM', 'drinking');

      // Get first slot for additional assertions
      const firstSlot = screen.getByText('10:00 AM').closest('.time-slot');
      const allComboboxes = within(firstSlot).getAllByRole('combobox');
      const behaviorSelect = allComboboxes[0];
      fireEvent.change(behaviorSelect, { target: { value: 'drinking' } });

      // Submit form
      const submitButton = screen.getByText(/Validate & Preview/i);
      fireEvent.click(submitButton);

      // Check output contains key data
      await waitFor(() => {
        const outputPreview = screen
          .getByText(/Data Preview/i)
          .closest('.output-preview');
        expect(outputPreview.textContent).toContain('TestObserver');
        expect(outputPreview.textContent).toContain('drinking');
        expect(outputPreview.textContent).toContain('10:00');
      });
    });
  });

  describe('Timezone Conversion', () => {
    test('converts times to WBS timezone in live mode', async () => {
      // Mock conversion function to return different time
      timezoneUtils.convertToWBSTime.mockImplementation((date, time) => {
        if (time === '10:00') return '11:00';
        if (time === '10:05') return '11:05';
        return time;
      });

      render(<App />);

      // Fill in metadata in live mode (default)
      await fillMetadata('TestObserver');

      const container = screen
        .getByText('Observation Time Range')
        .closest('.form-group');
      const timeInputs = container.querySelectorAll('input[type="time"]');
      fireEvent.change(timeInputs[0], { target: { value: '10:00' } });
      fireEvent.change(timeInputs[1], { target: { value: '10:05' } });

      // Fill in ALL observation slots
      await fillTimeSlot('10:00 AM', 'drinking');
      await fillTimeSlot('10:05 AM', 'drinking');

      // Submit form
      const submitButton = screen.getByText(/Validate & Preview/i);
      fireEvent.click(submitButton);

      // Check that convertToWBSTime was called
      await waitFor(() => {
        expect(timezoneUtils.convertToWBSTime).toHaveBeenCalled();
      });

      // Output should show converted times
      const outputPreview = screen
        .getByText(/Data Preview/i)
        .closest('.output-preview');
      expect(outputPreview.textContent).toContain('11:00');
      expect(outputPreview.textContent).toContain('observerTimezone');
    });

    test('does not convert times in VOD mode', async () => {
      timezoneUtils.convertToWBSTime.mockClear();

      render(<App />);

      // Switch to VOD mode
      const vodRadio = screen.getByRole('radio', { name: /Recorded Video/i });
      fireEvent.click(vodRadio);

      // Fill in metadata
      await fillMetadata('TestObserver');

      const container = screen
        .getByText('VOD Time Range')
        .closest('.form-group');
      const timeInputs = container.querySelectorAll('input[type="time"]');
      fireEvent.change(timeInputs[0], { target: { value: '10:00' } });
      fireEvent.change(timeInputs[1], { target: { value: '10:05' } });

      // Fill in ALL observation slots
      await fillTimeSlot('10:00 AM', 'drinking');
      await fillTimeSlot('10:05 AM', 'drinking');

      // Submit form
      const submitButton = screen.getByText(/Validate & Preview/i);
      fireEvent.click(submitButton);

      // convertToWBSTime should not be called in VOD mode
      await waitFor(() => {
        expect(screen.getByText(/Data Preview/i)).toBeInTheDocument();
      });
      expect(timezoneUtils.convertToWBSTime).not.toHaveBeenCalled();
    });
  });

  describe('Draft Autosave and Restoration', () => {
    test('saves draft when metadata changes', async () => {
      render(<App />);

      const observerInput = screen.getByPlaceholderText(
        /Enter your Discord username/i
      );
      fireEvent.change(observerInput, { target: { value: 'TestObserver' } });

      // Wait for autosave effect to trigger
      await waitFor(() => {
        expect(localStorageUtils.saveDraft).toHaveBeenCalled();
      });
    });

    test('saves draft when observation changes', async () => {
      render(<App />);

      // Create time slots
      const container = screen
        .getByText('Observation Time Range')
        .closest('.form-group');
      const timeInputs = container.querySelectorAll('input[type="time"]');
      fireEvent.change(timeInputs[0], { target: { value: '10:00' } });
      fireEvent.change(timeInputs[1], { target: { value: '10:05' } });

      // Wait for slots to be created
      await waitFor(() => {
        expect(screen.getByText('10:00 AM')).toBeInTheDocument();
      });

      localStorageUtils.saveDraft.mockClear();

      // Change observation
      const firstSlot = screen.getByText('10:00 AM').closest('.time-slot');
      const behaviorSelect = within(firstSlot).getByRole('combobox');
      fireEvent.change(behaviorSelect, { target: { value: 'preening' } });

      // Wait for autosave effect to trigger
      await waitFor(() => {
        expect(localStorageUtils.saveDraft).toHaveBeenCalled();
      });
    });

    test('shows draft notice when draft exists on mount', () => {
      const mockDraft = {
        metadata: {
          observerName: 'SavedObserver',
          date: '2025-11-21',
          startTime: '10:00',
          endTime: '10:10',
          aviary: "Sayyida's Cove",
          patient: 'Sayyida',
          mode: 'live',
        },
        observations: {},
        savedAt: '2025-11-21T10:00:00.000Z',
      };

      localStorageUtils.hasDraft.mockReturnValue(true);
      localStorageUtils.loadDraft.mockReturnValue(mockDraft);

      render(<App />);

      expect(screen.getByText(/Draft found!/i)).toBeInTheDocument();
      expect(screen.getByText(/Resume Draft/i)).toBeInTheDocument();
      expect(screen.getByText(/Start Fresh/i)).toBeInTheDocument();
    });

    test('restores draft when Resume Draft button is clicked', async () => {
      const mockDraft = {
        metadata: {
          observerName: 'SavedObserver',
          date: '2025-11-21',
          startTime: '10:00',
          endTime: '10:10',
          aviary: "Sayyida's Cove",
          patient: 'Sayyida',
          mode: 'live',
        },
        observations: {
          '10:00': {
            behavior: 'preening',
            location: '',
            notes: '',
            description: 'Saved work',
            object: '',
            objectOther: '',
            animal: '',
            animalOther: '',
            interactionType: '',
            interactionTypeOther: '',
          },
        },
        savedAt: '2025-11-21T10:00:00.000Z',
      };

      localStorageUtils.hasDraft.mockReturnValue(true);
      localStorageUtils.loadDraft.mockReturnValue(mockDraft);

      render(<App />);

      const resumeButton = screen.getByText(/Resume Draft/i);
      fireEvent.click(resumeButton);

      // Draft notice should disappear
      await waitFor(() => {
        expect(screen.queryByText(/Draft found!/i)).not.toBeInTheDocument();
      });

      // Data should be restored
      await waitFor(() => {
        const observerInput = screen.getByPlaceholderText(
          /Enter your Discord username/i
        );
        expect(observerInput).toHaveValue('SavedObserver');
      });
    });

    test('discards draft when Start Fresh button is clicked', () => {
      const mockDraft = {
        metadata: {
          observerName: 'SavedObserver',
          date: '2025-11-21',
          startTime: '10:00',
          endTime: '10:10',
          aviary: "Sayyida's Cove",
          patient: 'Sayyida',
          mode: 'live',
        },
        observations: {},
        savedAt: '2025-11-21T10:00:00.000Z',
      };

      localStorageUtils.hasDraft.mockReturnValue(true);
      localStorageUtils.loadDraft.mockReturnValue(mockDraft);

      render(<App />);

      const startFreshButton = screen.getByText(/Start Fresh/i);
      fireEvent.click(startFreshButton);

      // Draft should be cleared
      expect(localStorageUtils.clearDraft).toHaveBeenCalled();

      // Draft notice should disappear
      expect(screen.queryByText(/Draft found!/i)).not.toBeInTheDocument();
    });

    test('clears draft from localStorage after successful submission', async () => {
      render(<App />);

      // Fill in complete valid form
      await fillMetadata('TestObserver');

      const container = screen
        .getByText('Observation Time Range')
        .closest('.form-group');
      const timeInputs = container.querySelectorAll('input[type="time"]');
      fireEvent.change(timeInputs[0], { target: { value: '10:00' } });
      fireEvent.change(timeInputs[1], { target: { value: '10:05' } });

      // Fill in ALL observation slots
      await fillTimeSlot('10:00 AM', 'drinking');
      await fillTimeSlot('10:05 AM', 'drinking');

      const submitButton = screen.getByText(/Validate & Preview/i);
      fireEvent.click(submitButton);

      // Draft should be cleared after successful submission
      await waitFor(() => {
        expect(localStorageUtils.clearDraft).toHaveBeenCalled();
      });
    });
  });

  describe('Reset Form', () => {
    test('clears all form data when Reset Form button is clicked', async () => {
      render(<App />);

      // Fill in some data
      const observerInput = screen.getByPlaceholderText(
        /Enter your Discord username/i
      );
      fireEvent.change(observerInput, { target: { value: 'TestObserver' } });

      const container = screen
        .getByText('Observation Time Range')
        .closest('.form-group');
      const timeInputs = container.querySelectorAll('input[type="time"]');
      fireEvent.change(timeInputs[0], { target: { value: '10:00' } });
      fireEvent.change(timeInputs[1], { target: { value: '10:10' } });

      await waitFor(() => {
        expect(screen.getByText('10:00 AM')).toBeInTheDocument();
      });

      // Reset form
      const resetButton = screen.getByText(/Reset Form/i);
      fireEvent.click(resetButton);

      // Form should be cleared
      expect(observerInput).toHaveValue('');
      await waitFor(() => {
        expect(screen.queryByText('10:00 AM')).not.toBeInTheDocument();
      });
      expect(localStorageUtils.clearDraft).toHaveBeenCalled();
    });
  });
});
