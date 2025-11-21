import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimeSlotObservation from '../../src/components/TimeSlotObservation';

// Mock the form components
jest.mock('../../src/components/form', () => ({
  NotesField: ({ value, onChange }) => (
    <input data-testid="notes-field" value={value} onChange={onChange} />
  ),
  DescriptionField: ({ value, onChange, error }) => (
    <div>
      <input data-testid="description-field" value={value} onChange={onChange} />
      {error && <div data-testid="description-error">{error}</div>}
    </div>
  ),
  BehaviorSelect: ({ value, onChange, error }) => (
    <div>
      <select data-testid="behavior-select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select behavior</option>
        <option value="perching">Perching</option>
        <option value="jumping">Jumping</option>
        <option value="interacting_object">Interacting with Object</option>
        <option value="interacting_animal">Interacting with Animal</option>
        <option value="aggression">Aggression</option>
      </select>
      {error && <div data-testid="behavior-error">{error}</div>}
    </div>
  ),
  LocationInput: ({ value, onChange, error }) => (
    <div>
      <input data-testid="location-input" value={value} onChange={(e) => onChange({ value: e.target.value })} />
      {error && <div data-testid="location-error">{error}</div>}
    </div>
  ),
  ObjectSelect: ({ value, onChange, otherValue, onOtherChange, error, otherError }) => (
    <div>
      <select data-testid="object-select" value={value} onChange={onChange}>
        <option value="">Select object</option>
        <option value="newspaper">Newspaper</option>
        <option value="other">Other</option>
      </select>
      {value === 'other' && (
        <input data-testid="object-other" value={otherValue} onChange={onOtherChange} />
      )}
      {error && <div data-testid="object-error">{error}</div>}
      {otherError && <div data-testid="object-other-error">{otherError}</div>}
    </div>
  ),
  AnimalSelect: ({ value, onChange, otherValue, onOtherChange, error, otherError }) => (
    <div>
      <select data-testid="animal-select" value={value} onChange={onChange}>
        <option value="">Select animal</option>
        <option value="aviary_adult">Adult Aviary Occupant</option>
        <option value="other">Other</option>
      </select>
      {value === 'other' && (
        <input data-testid="animal-other" value={otherValue} onChange={onOtherChange} />
      )}
      {error && <div data-testid="animal-error">{error}</div>}
      {otherError && <div data-testid="animal-other-error">{otherError}</div>}
    </div>
  ),
  InteractionTypeSelect: ({ value, onChange, otherValue, onOtherChange, error, otherError }) => (
    <div>
      <select data-testid="interaction-type-select" value={value} onChange={onChange}>
        <option value="">Select interaction type</option>
        <option value="watching">Watching</option>
        <option value="other">Other</option>
      </select>
      {value === 'other' && (
        <input data-testid="interaction-type-other" value={otherValue} onChange={onOtherChange} />
      )}
      {error && <div data-testid="interaction-type-error">{error}</div>}
      {otherError && <div data-testid="interaction-type-other-error">{otherError}</div>}
    </div>
  )
}));

describe('TimeSlotObservation', () => {
  const defaultObservation = {
    behavior: '',
    location: '',
    notes: '',
    object: '',
    objectOther: '',
    animal: '',
    animalOther: '',
    interactionType: '',
    interactionTypeOther: '',
    description: ''
  };

  const mockOnChange = jest.fn();
  const mockOnValidate = jest.fn();
  const mockOnCopyToNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    test('renders time slot header with formatted time', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={defaultObservation}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      expect(screen.getByText('3:00 PM')).toBeInTheDocument();
    });

    test('always renders behavior select and notes field', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={defaultObservation}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      expect(screen.getByTestId('behavior-select')).toBeInTheDocument();
      expect(screen.getByTestId('notes-field')).toBeInTheDocument();
    });

    test('renders copy to next button when not last slot', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={defaultObservation}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      expect(screen.getByText('Copy to next')).toBeInTheDocument();
    });

    test('does not render copy to next button when last slot', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={defaultObservation}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={true}
        />
      );

      expect(screen.queryByText('Copy to next')).not.toBeInTheDocument();
    });
  });

  describe('Conditional Field Rendering', () => {
    test('shows location input when behavior requires location (preening)', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={{ ...defaultObservation, behavior: 'preening' }}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      expect(screen.getByTestId('location-input')).toBeInTheDocument();
    });

    test('does not show location input when behavior does not require it', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={{ ...defaultObservation, behavior: '' }}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      expect(screen.queryByTestId('location-input')).not.toBeInTheDocument();
    });

    test('shows object select when behavior requires object (interacting_object)', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={{ ...defaultObservation, behavior: 'interacting_object' }}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      expect(screen.getByTestId('object-select')).toBeInTheDocument();
    });

    test('shows animal and interaction type selects when behavior requires animal (interacting_animal)', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={{ ...defaultObservation, behavior: 'interacting_animal' }}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      expect(screen.getByTestId('animal-select')).toBeInTheDocument();
      expect(screen.getByTestId('interaction-type-select')).toBeInTheDocument();
    });

    test('shows description field when behavior requires description (aggression)', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={{ ...defaultObservation, behavior: 'aggression' }}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      expect(screen.getByTestId('description-field')).toBeInTheDocument();
    });
  });

  describe('Behavior Selection', () => {
    test('calls onChange and onValidate immediately when behavior changes', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={defaultObservation}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      const behaviorSelect = screen.getByTestId('behavior-select');
      fireEvent.change(behaviorSelect, { target: { value: 'perching' } });

      expect(mockOnChange).toHaveBeenCalledWith('15:00', 'behavior', 'perching');
      expect(mockOnValidate).toHaveBeenCalledWith('15:00', 'behavior', 'perching');
    });
  });

  describe('Location Input', () => {
    test('calls onChange and onValidate immediately when location changes', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={{ ...defaultObservation, behavior: 'preening' }}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      const locationInput = screen.getByTestId('location-input');
      fireEvent.change(locationInput, { target: { value: '12' } });

      expect(mockOnChange).toHaveBeenCalledWith('15:00', 'location', '12');
      expect(mockOnValidate).toHaveBeenCalledWith('15:00', 'location', '12');
    });

    test('displays location error when present', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={{ ...defaultObservation, behavior: 'preening' }}
          locationError="Location is required"
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      expect(screen.getByTestId('location-error')).toHaveTextContent('Location is required');
    });
  });

  describe('Object Selection', () => {
    test('calls onChange and onValidate immediately when object changes', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={{ ...defaultObservation, behavior: 'interacting_object' }}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      const objectSelect = screen.getByTestId('object-select');
      fireEvent.change(objectSelect, { target: { value: 'newspaper' } });

      expect(mockOnChange).toHaveBeenCalledWith('15:00', 'object', 'newspaper');
      expect(mockOnValidate).toHaveBeenCalledWith('15:00', 'object', 'newspaper');
    });

    test('shows "other" text field when object is "other"', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={{ ...defaultObservation, behavior: 'interacting_object', object: 'other' }}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      expect(screen.getByTestId('object-other')).toBeInTheDocument();
    });

    test('debounces validation for objectOther text input', async () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={{ ...defaultObservation, behavior: 'interacting_object', object: 'other' }}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      const objectOtherInput = screen.getByTestId('object-other');
      fireEvent.change(objectOtherInput, { target: { value: 'custom object' } });

      // onChange should be called immediately
      expect(mockOnChange).toHaveBeenCalledWith('15:00', 'objectOther', 'custom object');

      // onValidate should not be called yet
      expect(mockOnValidate).not.toHaveBeenCalled();

      // Fast forward 200ms for debounce
      jest.advanceTimersByTime(200);

      // Now onValidate should be called
      await waitFor(() => {
        expect(mockOnValidate).toHaveBeenCalledWith('15:00', 'objectOther', 'custom object');
      });
    });
  });

  describe('Animal and Interaction Type Selection', () => {
    test('calls onChange and onValidate immediately when animal changes', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={{ ...defaultObservation, behavior: 'interacting_animal' }}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      const animalSelect = screen.getByTestId('animal-select');
      fireEvent.change(animalSelect, { target: { value: 'aviary_adult' } });

      expect(mockOnChange).toHaveBeenCalledWith('15:00', 'animal', 'aviary_adult');
      expect(mockOnValidate).toHaveBeenCalledWith('15:00', 'animal', 'aviary_adult');
    });

    test('calls onChange and onValidate immediately when interaction type changes', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={{ ...defaultObservation, behavior: 'interacting_animal' }}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      const interactionTypeSelect = screen.getByTestId('interaction-type-select');
      fireEvent.change(interactionTypeSelect, { target: { value: 'watching' } });

      expect(mockOnChange).toHaveBeenCalledWith('15:00', 'interactionType', 'watching');
      expect(mockOnValidate).toHaveBeenCalledWith('15:00', 'interactionType', 'watching');
    });

    test('shows "other" fields when animal is "other"', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={{ ...defaultObservation, behavior: 'interacting_animal', animal: 'other' }}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      expect(screen.getByTestId('animal-other')).toBeInTheDocument();
    });

    test('shows "other" field when interaction type is "other"', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={{ ...defaultObservation, behavior: 'interacting_animal', interactionType: 'other' }}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      expect(screen.getByTestId('interaction-type-other')).toBeInTheDocument();
    });
  });

  describe('Description Field', () => {
    test('debounces validation for description text input', async () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={{ ...defaultObservation, behavior: 'aggression' }}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      const descriptionField = screen.getByTestId('description-field');
      fireEvent.change(descriptionField, { target: { value: 'Aggressive behavior' } });

      // onChange should be called immediately
      expect(mockOnChange).toHaveBeenCalledWith('15:00', 'description', 'Aggressive behavior');

      // onValidate should not be called yet
      expect(mockOnValidate).not.toHaveBeenCalled();

      // Fast forward 200ms for debounce
      jest.advanceTimersByTime(200);

      // Now onValidate should be called
      await waitFor(() => {
        expect(mockOnValidate).toHaveBeenCalledWith('15:00', 'description', 'Aggressive behavior');
      });
    });

    test('displays description error when present', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={{ ...defaultObservation, behavior: 'aggression' }}
          descriptionError="Description is required"
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      expect(screen.getByTestId('description-error')).toHaveTextContent('Description is required');
    });
  });

  describe('Notes Field', () => {
    test('calls onChange when notes changes', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={defaultObservation}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      const notesField = screen.getByTestId('notes-field');
      fireEvent.change(notesField, { target: { value: 'Some notes' } });

      // Notes field onChange passes the event object directly
      expect(mockOnChange).toHaveBeenCalledWith('15:00', 'notes', 'Some notes');
    });
  });

  describe('Copy to Next Button', () => {
    test('calls onCopyToNext with correct time when clicked', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={defaultObservation}
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      const copyButton = screen.getByText('Copy to next');
      fireEvent.click(copyButton);

      expect(mockOnCopyToNext).toHaveBeenCalledWith('15:00');
    });
  });

  describe('Error Display', () => {
    test('displays all error types when present', () => {
      render(
        <TimeSlotObservation
          time="15:00"
          observation={{
            ...defaultObservation,
            behavior: 'interacting_animal',
            object: 'other',
            animal: 'other',
            interactionType: 'other'
          }}
          behaviorError="Behavior error"
          locationError="Location error"
          objectError="Object error"
          objectOtherError="Object other error"
          animalError="Animal error"
          animalOtherError="Animal other error"
          interactionTypeError="Interaction type error"
          interactionTypeOtherError="Interaction type other error"
          onChange={mockOnChange}
          onValidate={mockOnValidate}
          onCopyToNext={mockOnCopyToNext}
          isLastSlot={false}
        />
      );

      expect(screen.getByTestId('behavior-error')).toHaveTextContent('Behavior error');
      expect(screen.getByTestId('animal-error')).toHaveTextContent('Animal error');
      expect(screen.getByTestId('animal-other-error')).toHaveTextContent('Animal other error');
      expect(screen.getByTestId('interaction-type-error')).toHaveTextContent('Interaction type error');
      expect(screen.getByTestId('interaction-type-other-error')).toHaveTextContent('Interaction type other error');
    });
  });
});
