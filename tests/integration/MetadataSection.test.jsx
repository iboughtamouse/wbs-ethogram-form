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
    mode: 'live'
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

      expect(screen.getByPlaceholderText(/Enter your Discord username/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(defaultMetadata.date)).toBeInTheDocument();
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

    test('shows live mode help text when mode is live', () => {
      render(
        <MetadataSection
          metadata={defaultMetadata}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText(/Enter times in YOUR local time/i)).toBeInTheDocument();
    });

    test('shows VOD mode help text when mode is vod', () => {
      render(
        <MetadataSection
          metadata={{ ...defaultMetadata, mode: 'vod' }}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText(/Enter times exactly as shown on stream/i)).toBeInTheDocument();
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

      const input = screen.getByPlaceholderText(/Enter your Discord username/i);
      fireEvent.change(input, { target: { value: 'TestUser' } });

      expect(mockOnChange).toHaveBeenCalledWith('observerName', 'TestUser', true);
    });

    test('prevents Enter key from submitting and triggers validation', () => {
      render(
        <MetadataSection
          metadata={defaultMetadata}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByPlaceholderText(/Enter your Discord username/i);
      fireEvent.keyDown(input, { key: 'Enter' });

      // onChange should be called with the current value
      expect(mockOnChange).toHaveBeenCalledWith('observerName', '', true);
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

      const input = screen.getByPlaceholderText(/Enter your Discord username/i);
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
          metadata={{ ...defaultMetadata, startTime: '15:00', endTime: '15:30' }}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByDisplayValue('15:00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('15:30')).toBeInTheDocument();
    });

    test('calls onChange with rounded time for startTime', () => {
      render(
        <MetadataSection
          metadata={defaultMetadata}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      // Get time inputs by type
      const container = screen.getByText('Observation Time Range').parentElement.parentElement;
      const timeInputs = container.querySelectorAll('input[type="time"]');
      const startTimeInput = timeInputs[0];
      fireEvent.change(startTimeInput, { target: { value: '15:03' } });

      // Time should be rounded to nearest 5 minutes (15:05)
      expect(mockOnChange).toHaveBeenCalledWith('startTime', '15:05', true);
    });

    test('calls onChange with rounded time for endTime', () => {
      render(
        <MetadataSection
          metadata={defaultMetadata}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      // Get time inputs by type
      const container = screen.getByText('Observation Time Range').parentElement.parentElement;
      const timeInputs = container.querySelectorAll('input[type="time"]');
      const endTimeInput = timeInputs[1];
      fireEvent.change(endTimeInput, { target: { value: '15:28' } });

      // Time should be rounded to nearest 5 minutes (15:30)
      expect(mockOnChange).toHaveBeenCalledWith('endTime', '15:30', true);
    });

    test('displays time range validation error when start >= end', () => {
      render(
        <MetadataSection
          metadata={{ ...defaultMetadata, startTime: '15:30', endTime: '15:00' }}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      // When end is before start, duration is negative, which is < 5 minutes
      expect(screen.getByText('Time range must be at least 5 minutes')).toBeInTheDocument();
    });

    test('displays time range validation error when range > 60 minutes', () => {
      render(
        <MetadataSection
          metadata={{ ...defaultMetadata, startTime: '15:00', endTime: '16:30' }}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      // Actual error message from timeUtils.js
      expect(screen.getByText('Time range cannot exceed 1 hour')).toBeInTheDocument();
    });

    test('adds error class to time inputs when time range is invalid', () => {
      render(
        <MetadataSection
          metadata={{ ...defaultMetadata, startTime: '15:30', endTime: '15:00' }}
          fieldErrors={defaultFieldErrors}
          onChange={mockOnChange}
        />
      );

      const container = screen.getByText('Observation Time Range').parentElement.parentElement;
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

      const container = screen.getByText('Observation Time Range').parentElement.parentElement;
      const timeInputs = container.querySelectorAll('input[type="time"]');
      const startTimeInput = timeInputs[0];
      const endTimeInput = timeInputs[1];
      expect(startTimeInput).toHaveAttribute('step', '300'); // 300 seconds = 5 minutes
      expect(endTimeInput).toHaveAttribute('step', '300');
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
