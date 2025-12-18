import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MetadataSection from '../../src/components/MetadataSection';

describe('MetadataSection', () => {
  const defaultMetadata = {
    observerName: '',
    date: '2025-11-21',
    startTime: '',
    endTime: '',
    aviary: "Sayyida's Cove",
    patient: 'Sayyida',
    mode: 'live',
  };

  const defaultFieldErrors = {};
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('Rendering', () => {
    test('renders all form fields', () => {
      render(
        <MetadataSection
          metadata={defaultMetadata}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      expect(
        screen.getByPlaceholderText(/Enter your name/i)
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(defaultMetadata.date)
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue("Sayyida's Cove")).toBeInTheDocument();
      expect(screen.getByDisplayValue('Sayyida')).toBeInTheDocument();
    });

    test('renders mode selector with both options', () => {
      render(
        <MetadataSection
          metadata={defaultMetadata}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Live Stream')).toBeInTheDocument();
      expect(screen.getByText('Recorded Video (VOD)')).toBeInTheDocument();
    });

    test('live mode is selected by default', () => {
      render(
        <MetadataSection
          metadata={defaultMetadata}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      const liveRadio = screen.getByRole('radio', { name: /Live Stream/i });
      const vodRadio = screen.getByRole('radio', { name: /Recorded Video/i });

      expect(liveRadio).toBeChecked();
      expect(vodRadio).not.toBeChecked();
    });

    test('renders aviary and patient as read-only', () => {
      render(
        <MetadataSection
          metadata={defaultMetadata}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      const aviaryInput = screen.getByDisplayValue("Sayyida's Cove");
      const patientInput = screen.getByDisplayValue('Sayyida');

      expect(aviaryInput).toHaveAttribute('readonly');
      expect(aviaryInput).toBeDisabled();
      expect(patientInput).toHaveAttribute('readonly');
      expect(patientInput).toBeDisabled();
    });

    test('shows video timestamp help text for live mode', () => {
      render(
        <MetadataSection
          metadata={defaultMetadata}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      expect(
        screen.getByText(/Enter times exactly as shown on the video timestamp/i)
      ).toBeInTheDocument();
    });

    test('shows same help text for VOD mode', () => {
      render(
        <MetadataSection
          metadata={{ ...defaultMetadata, mode: 'vod' }}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      // Both modes show identical help text (no timezone conversion)
      expect(
        screen.getByText(/Enter times exactly as shown on the video timestamp/i)
      ).toBeInTheDocument();
    });
  });

  describe('Mode Selection', () => {
    test('calls onChange when switching to VOD mode', () => {
      render(
        <MetadataSection
          metadata={defaultMetadata}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      const vodRadio = screen.getByRole('radio', { name: /Recorded Video/i });
      fireEvent.click(vodRadio);

      expect(mockOnChange).toHaveBeenCalledWith('mode', 'vod');
    });

    test('calls onChange when switching to live mode', () => {
      render(
        <MetadataSection
          metadata={{ ...defaultMetadata, mode: 'vod' }}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      const liveRadio = screen.getByRole('radio', { name: /Live Stream/i });
      fireEvent.click(liveRadio);

      expect(mockOnChange).toHaveBeenCalledWith('mode', 'live');
    });
  });

  describe('Observer Name Input', () => {
    test('displays current observer name value', () => {
      render(
        <MetadataSection
          metadata={{ ...defaultMetadata, observerName: 'TestUser' }}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByDisplayValue('TestUser')).toBeInTheDocument();
    });

    test('calls onChange with validation when typing', () => {
      render(
        <MetadataSection
          metadata={defaultMetadata}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText(/Enter your name/i);
      fireEvent.change(input, { target: { value: 'TestUser' } });

      expect(mockOnChange).toHaveBeenCalledWith(
        'observerName',
        'TestUser',
        true
      );
    });

    test('prevents Enter key from submitting and triggers validation', () => {
      render(
        <MetadataSection
          metadata={defaultMetadata}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText(/Enter your name/i);
      fireEvent.keyDown(input, { key: 'Enter' });

      // onChange should be called with the current value
      expect(mockOnChange).toHaveBeenCalledWith('observerName', '', true);
    });

    test('does not apply time rounding to observer name on Enter key', () => {
      render(
        <MetadataSection
          metadata={{ ...defaultMetadata, observerName: 'John Doe' }}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText(/Enter your name/i);
      fireEvent.keyDown(input, { key: 'Enter' });

      // Should validate with the text value, NOT apply time rounding (which would result in NaN:NaN)
      expect(mockOnChange).toHaveBeenCalledWith(
        'observerName',
        'John Doe',
        true
      );
      // Verify it was NOT called with rounded time result
      expect(mockOnChange).not.toHaveBeenCalledWith(
        'observerName',
        'NaN:NaN',
        true
      );
    });

    test('displays validation error when present', () => {
      render(
        <MetadataSection
          metadata={defaultMetadata}
          fieldErrors={{ observerName: 'Observer name is required' }}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Observer name is required')).toBeInTheDocument();
    });

    test('adds error class to input when validation fails', () => {
      render(
        <MetadataSection
          metadata={defaultMetadata}
          fieldErrors={{ observerName: 'Observer name is required' }}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText(/Enter your name/i);
      expect(input).toHaveClass('error');
    });
  });

  describe('Date Input', () => {
    test('displays current date value', () => {
      render(
        <MetadataSection
          metadata={{ ...defaultMetadata, date: '2025-11-21' }}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      const dateInput = screen.getByDisplayValue('2025-11-21');
      expect(dateInput).toHaveValue('2025-11-21');
    });

    test('calls onChange with validation when date changes', () => {
      render(
        <MetadataSection
          metadata={defaultMetadata}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      const dateInput = screen.getByDisplayValue(defaultMetadata.date);
      fireEvent.change(dateInput, { target: { value: '2025-11-22' } });

      expect(mockOnChange).toHaveBeenCalledWith('date', '2025-11-22', true);
    });

    test('displays validation error when present', () => {
      render(
        <MetadataSection
          metadata={defaultMetadata}
          fieldErrors={{ date: 'Date is required' }}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Date is required')).toBeInTheDocument();
    });
  });

  describe('Time Range Inputs', () => {
    test('displays start and end time values', () => {
      render(
        <MetadataSection
          metadata={{
            ...defaultMetadata,
            startTime: '15:00',
            endTime: '15:30',
          }}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByDisplayValue('15:00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('15:30')).toBeInTheDocument();
    });

    test('calls onChange with rounded time for startTime', () => {
      const { rerender } = render(
        <MetadataSection
          metadata={defaultMetadata}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      // Get time inputs by type
      const container = screen.getByText('Observation Time Range').parentElement
        .parentElement;
      const timeInputs = container.querySelectorAll('input[type="time"]');
      const startTimeInput = timeInputs[0];
      fireEvent.change(startTimeInput, { target: { value: '15:03' } });

      // onChange should be called without validation
      expect(mockOnChange).toHaveBeenCalledWith('startTime', '15:03', false);

      // Simulate parent updating the metadata state
      const updatedMetadata = { ...defaultMetadata, startTime: '15:03' };
      rerender(
        <MetadataSection
          metadata={updatedMetadata}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      // Blur should round and validate
      mockOnChange.mockClear();
      const updatedTimeInputs =
        container.querySelectorAll('input[type="time"]');
      fireEvent.blur(updatedTimeInputs[0]);
      expect(mockOnChange).toHaveBeenCalledWith('startTime', '15:05', true);
    });

    test('calls onChange with rounded time for endTime', () => {
      const { rerender } = render(
        <MetadataSection
          metadata={defaultMetadata}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      // Get time inputs by type
      const container = screen.getByText('Observation Time Range').parentElement
        .parentElement;
      const timeInputs = container.querySelectorAll('input[type="time"]');
      const endTimeInput = timeInputs[1];
      fireEvent.change(endTimeInput, { target: { value: '15:28' } });

      // onChange should be called without validation
      expect(mockOnChange).toHaveBeenCalledWith('endTime', '15:28', false);

      // Simulate parent updating the metadata state
      const updatedMetadata = { ...defaultMetadata, endTime: '15:28' };
      rerender(
        <MetadataSection
          metadata={updatedMetadata}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      // Blur should round and validate
      mockOnChange.mockClear();
      const updatedTimeInputs =
        container.querySelectorAll('input[type="time"]');
      fireEvent.blur(updatedTimeInputs[1]);
      expect(mockOnChange).toHaveBeenCalledWith('endTime', '15:30', true);
    });

    test('displays time range validation error when midnight crossing exceeds 1 hour', () => {
      render(
        <MetadataSection
          metadata={{
            ...defaultMetadata,
            startTime: '15:30',
            endTime: '15:00',
          }}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      // When end is before start, it's treated as midnight crossing (15:30 → next day 15:00)
      // This would be ~23.5 hours, which exceeds the 1-hour maximum
      expect(
        screen.getByText('Time range cannot exceed 1 hour')
      ).toBeInTheDocument();
    });

    test('displays time range validation error when range > 60 minutes', () => {
      render(
        <MetadataSection
          metadata={{
            ...defaultMetadata,
            startTime: '15:00',
            endTime: '16:30',
          }}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      // Actual error message from timeUtils.js
      expect(
        screen.getByText('Time range cannot exceed 1 hour')
      ).toBeInTheDocument();
    });

    test('adds error class to time inputs when time range is invalid', () => {
      render(
        <MetadataSection
          metadata={{
            ...defaultMetadata,
            startTime: '15:30',
            endTime: '15:00',
          }}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      const container = screen.getByText('Observation Time Range').parentElement
        .parentElement;
      const timeInputs = container.querySelectorAll('input[type="time"]');
      const startTimeInput = timeInputs[0];
      const endTimeInput = timeInputs[1];
      expect(startTimeInput).toHaveClass('error');
      expect(endTimeInput).toHaveClass('error');
    });

    test('has 5-minute step attribute on time inputs', () => {
      render(
        <MetadataSection
          metadata={defaultMetadata}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      const container = screen.getByText('Observation Time Range').parentElement
        .parentElement;
      const timeInputs = container.querySelectorAll('input[type="time"]');
      const startTimeInput = timeInputs[0];
      const endTimeInput = timeInputs[1];
      expect(startTimeInput).toHaveAttribute('step', '300'); // 300 seconds = 5 minutes
      expect(endTimeInput).toHaveAttribute('step', '300');
    });

    test('rounds and validates time input on Enter key', () => {
      render(
        <MetadataSection
          metadata={{ ...defaultMetadata, startTime: '10:03' }}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      const container = screen.getByText('Observation Time Range').parentElement
        .parentElement;
      const timeInputs = container.querySelectorAll('input[type="time"]');
      const startTimeInput = timeInputs[0];

      // Press Enter on time input with non-rounded value
      fireEvent.keyDown(startTimeInput, { key: 'Enter' });

      // Should round to nearest 5 minutes and validate
      expect(mockOnChange).toHaveBeenCalledWith('startTime', '10:05', true);
    });

    test('handles clearing time input on blur', () => {
      const { rerender } = render(
        <MetadataSection
          metadata={{ ...defaultMetadata, startTime: '10:00' }}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      const container = screen.getByText('Observation Time Range').parentElement
        .parentElement;
      const timeInputs = container.querySelectorAll('input[type="time"]');
      const startTimeInput = timeInputs[0];

      // Simulate user clearing the input
      fireEvent.change(startTimeInput, { target: { value: '' } });

      // Rerender with cleared value to simulate state update
      rerender(
        <MetadataSection
          metadata={{ ...defaultMetadata, startTime: '' }}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      // Clear mock from the change event
      mockOnChange.mockClear();

      // Trigger blur with empty value
      const updatedTimeInputs =
        container.querySelectorAll('input[type="time"]');
      fireEvent.blur(updatedTimeInputs[0]);

      // Should validate with empty string (not crash or pass undefined)
      expect(mockOnChange).toHaveBeenCalledWith('startTime', '', true);
    });
  });

  describe('Label Changes Based on Mode', () => {
    test('shows "Observation Time Range" label in live mode', () => {
      render(
        <MetadataSection
          metadata={{ ...defaultMetadata, mode: 'live' }}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText(/Observation Time Range/i)).toBeInTheDocument();
    });

    test('shows "VOD Time Range" label in vod mode', () => {
      render(
        <MetadataSection
          metadata={{ ...defaultMetadata, mode: 'vod' }}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText(/VOD Time Range/i)).toBeInTheDocument();
    });
  });
});
