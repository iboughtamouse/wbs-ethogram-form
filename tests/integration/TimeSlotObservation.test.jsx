import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TimeSlotObservation from '../../src/components/TimeSlotObservation';
import {
  GENERIC_JUVENILE_ID,
  GENERIC_JUVENILE_LABEL,
} from '../../src/constants/ui';

// Mock the form components
jest.mock('../../src/components/form', () => ({
  NotesField: ({ value, onChange }) => (
    <input data-testid="notes-field" value={value} onChange={onChange} />
  ),
  DescriptionField: ({ value, onChange, error }) => (
    <div>
      <input
        data-testid="description-field"
        value={value}
        onChange={onChange}
      />
      {error && <div data-testid="description-error">{error}</div>}
    </div>
  ),
  BehaviorSelect: ({ value, onChange, error }) => (
    <div>
      <select
        data-testid="behavior-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select behavior</option>
        <option value="perching">Perching</option>
        <option value="jumping">Jumping</option>
        <option value="interacting_object">Interacting with Object</option>
        <option value="interacting_animal">Interacting with Animal</option>
        <option value="other">Other</option>
      </select>
      {error && <div data-testid="behavior-error">{error}</div>}
    </div>
  ),
  LocationInput: ({ value, onChange, error }) => (
    <div>
      <input
        data-testid="location-input"
        value={value}
        onChange={(e) => onChange({ value: e.target.value })}
      />
      {error && <div data-testid="location-error">{error}</div>}
    </div>
  ),
  ObjectSelect: ({
    value,
    onChange,
    otherValue,
    onOtherChange,
    error,
    otherError,
  }) => (
    <div>
      <select data-testid="object-select" value={value} onChange={onChange}>
        <option value="">Select object</option>
        <option value="newspaper">Newspaper</option>
        <option value="other">Other</option>
      </select>
      {value === 'other' && (
        <input
          data-testid="object-other"
          value={otherValue}
          onChange={onOtherChange}
        />
      )}
      {error && <div data-testid="object-error">{error}</div>}
      {otherError && <div data-testid="object-other-error">{otherError}</div>}
    </div>
  ),
  AnimalSelect: ({
    value,
    onChange,
    otherValue,
    onOtherChange,
    error,
    otherError,
  }) => (
    <div>
      <select data-testid="animal-select" value={value} onChange={onChange}>
        <option value="">Select animal</option>
        <option value="aviary_adult">Adult Aviary Occupant</option>
        <option value="other">Other</option>
      </select>
      {value === 'other' && (
        <input
          data-testid="animal-other"
          value={otherValue}
          onChange={onOtherChange}
        />
      )}
      {error && <div data-testid="animal-error">{error}</div>}
      {otherError && <div data-testid="animal-other-error">{otherError}</div>}
    </div>
  ),
  InteractionTypeSelect: ({
    label,
    options,
    value,
    onChange,
    otherValue,
    onOtherChange,
    error,
    otherError,
  }) => (
    <div>
      {label && <label data-testid="interaction-type-label">{label}</label>}
      <select
        data-testid="interaction-type-select"
        value={value}
        onChange={onChange}
      >
        <option value="">Select interaction type</option>
        <option value="watching">Watching</option>
        <option value="other">Other</option>
      </select>
      {value === 'other' && (
        <input
          data-testid="interaction-type-other"
          value={otherValue}
          onChange={onOtherChange}
        />
      )}
      {error && <div data-testid="interaction-type-error">{error}</div>}
      {otherError && (
        <div data-testid="interaction-type-other-error">{otherError}</div>
      )}
    </div>
  ),
}));

describe('TimeSlotObservation', () => {
  // Sayyida is present in the bundled config from 2025-12-15 (no departure)
  // and the juveniles arrive 2026-06-01, so this date has exactly one
  // present subject.
  const OBSERVATION_DATE = '2025-12-25';

  // A date on which Sayyida AND the juveniles (187(B), 216(O), 253(R))
  // are all present — enables the generic juvenile button (P2-D8).
  const JUVENILE_DATE = '2026-06-15';

  // Helper to build a per-subject observation card. Cards are keyed by a
  // slot-local cardId (NOT subjectId — generic juvenile cards may duplicate
  // a subjectId within a slot); any unique string works in tests.
  const makeCard = (overrides = {}) => ({
    cardId: 'card-sayyida',
    subjectType: 'foster_parent',
    subjectId: 'Sayyida',
    behavior: '',
    location: '',
    notes: '',
    object: '',
    objectOther: '',
    objectInteractionType: '',
    objectInteractionTypeOther: '',
    animal: '',
    animalOther: '',
    animalInteractionType: '',
    animalInteractionTypeOther: '',
    description: '',
    ...overrides,
  });

  const mockOnChange = jest.fn();
  const mockOnValidate = jest.fn();
  const mockOnAddSubject = jest.fn();
  const mockOnRemoveSubject = jest.fn();
  const mockOnCopyToNext = jest.fn();

  // Helper to render TimeSlotObservation with default props
  const renderTimeSlotObservation = (props = {}) => {
    return render(
      <TimeSlotObservation
        time="15:00"
        observations={[makeCard()]}
        observationDate={OBSERVATION_DATE}
        fieldErrors={{}}
        onChange={mockOnChange}
        onValidate={mockOnValidate}
        onAddSubject={mockOnAddSubject}
        onRemoveSubject={mockOnRemoveSubject}
        onCopyToNext={mockOnCopyToNext}
        isLastSlot={false}
        {...props}
      />
    );
  };

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
      renderTimeSlotObservation();

      expect(screen.getByText('3:00 PM')).toBeInTheDocument();
    });

    test('always renders behavior select and notes field', () => {
      renderTimeSlotObservation();

      expect(screen.getByTestId('behavior-select')).toBeInTheDocument();
      expect(screen.getByTestId('notes-field')).toBeInTheDocument();
    });

    test('renders copy to next button when not last slot', () => {
      renderTimeSlotObservation({ isLastSlot: false });

      expect(screen.getByText('Copy to next')).toBeInTheDocument();
    });

    test('does not render copy to next button when last slot', () => {
      renderTimeSlotObservation({ isLastSlot: true });

      expect(screen.queryByText('Copy to next')).not.toBeInTheDocument();
    });
  });

  describe('Subject Cards', () => {
    test('renders one card per array entry with subject-name headers', () => {
      renderTimeSlotObservation({
        observations: [
          makeCard(),
          makeCard({
            cardId: 'card-chick',
            subjectType: 'chick',
            subjectId: 'Chick 1',
          }),
        ],
      });

      expect(screen.getByText('Sayyida')).toBeInTheDocument();
      expect(screen.getByText('Chick 1')).toBeInTheDocument();
      expect(screen.getAllByTestId('behavior-select')).toHaveLength(2);
      expect(screen.getAllByTestId('notes-field')).toHaveLength(2);
    });

    test('flags a card whose subject is not listed for the observation date', () => {
      renderTimeSlotObservation({
        observations: [
          makeCard(),
          makeCard({
            cardId: 'card-chick',
            subjectType: 'chick',
            subjectId: 'Chick 1',
          }),
        ],
      });

      // Chick 1 has no residency episode in the bundled config
      expect(screen.getByText('not listed for this date')).toBeInTheDocument();
    });

    test('does not render a Remove button when the slot has a single card', () => {
      renderTimeSlotObservation();

      expect(screen.queryByText('Remove')).not.toBeInTheDocument();
    });

    test('renders Remove buttons when the slot has more than one card and calls onRemoveSubject', () => {
      renderTimeSlotObservation({
        observations: [
          makeCard(),
          makeCard({
            cardId: 'card-chick',
            subjectType: 'chick',
            subjectId: 'Chick 1',
          }),
        ],
      });

      const removeButtons = screen.getAllByText('Remove');
      expect(removeButtons).toHaveLength(2);

      fireEvent.click(removeButtons[0]);

      expect(mockOnRemoveSubject).toHaveBeenCalledWith('15:00', 'card-sayyida');
    });

    test('shows "+ Add" button for a present subject without a card and calls onAddSubject', () => {
      renderTimeSlotObservation({
        observations: [
          makeCard({
            cardId: 'card-chick',
            subjectType: 'chick',
            subjectId: 'Chick 1',
          }),
        ],
      });

      const addButton = screen.getByText('+ Add Sayyida');
      fireEvent.click(addButton);

      expect(mockOnAddSubject).toHaveBeenCalledWith(
        '15:00',
        expect.objectContaining({ name: 'Sayyida' })
      );
    });

    test('does not show "+ Add" button when every present subject has a card', () => {
      renderTimeSlotObservation();

      expect(screen.queryByText(/\+ Add/)).not.toBeInTheDocument();
    });
  });

  describe('Generic Juvenile Cards (P2-D8)', () => {
    test('renders the "+ Add Juvenile (unidentified)" button when juveniles are present on the date', () => {
      renderTimeSlotObservation({ observationDate: JUVENILE_DATE });

      expect(
        screen.getByText(`+ Add ${GENERIC_JUVENILE_LABEL}`)
      ).toBeInTheDocument();
    });

    test('does not render the generic juvenile button when no juveniles are present on the date', () => {
      renderTimeSlotObservation({ observationDate: OBSERVATION_DATE });

      expect(
        screen.queryByText(`+ Add ${GENERIC_JUVENILE_LABEL}`)
      ).not.toBeInTheDocument();
    });

    test('clicking the generic juvenile button calls onAddSubject with the repeatable generic subject', () => {
      renderTimeSlotObservation({ observationDate: JUVENILE_DATE });

      fireEvent.click(screen.getByText(`+ Add ${GENERIC_JUVENILE_LABEL}`));

      expect(mockOnAddSubject).toHaveBeenCalledWith('15:00', {
        type: 'juvenile',
        name: GENERIC_JUVENILE_ID,
        allowDuplicate: true,
      });
    });

    test('a generic card renders the unidentified label header without the not-listed flag', () => {
      renderTimeSlotObservation({
        observationDate: JUVENILE_DATE,
        observations: [
          makeCard({
            cardId: 'card-generic',
            subjectType: 'juvenile',
            subjectId: GENERIC_JUVENILE_ID,
          }),
        ],
      });

      // The card header shows the friendly label, not the raw generic id
      expect(screen.getByText(GENERIC_JUVENILE_LABEL)).toBeInTheDocument();
      expect(
        screen.queryByText('not listed for this date')
      ).not.toBeInTheDocument();
    });
  });

  describe('Conditional Field Rendering', () => {
    test('shows location input when behavior requires location (preening)', () => {
      renderTimeSlotObservation({
        observations: [makeCard({ behavior: 'preening' })],
      });

      expect(screen.getByTestId('location-input')).toBeInTheDocument();
    });

    test('does not show location input when behavior does not require it', () => {
      renderTimeSlotObservation({
        observations: [makeCard({ behavior: '' })],
      });

      expect(screen.queryByTestId('location-input')).not.toBeInTheDocument();
    });

    test('shows object select when behavior requires object (interacting_object)', () => {
      renderTimeSlotObservation({
        observations: [makeCard({ behavior: 'interacting_object' })],
      });

      expect(screen.getByTestId('object-select')).toBeInTheDocument();
    });

    test('shows animal and interaction type selects when behavior requires animal (interacting_animal)', () => {
      renderTimeSlotObservation({
        observations: [makeCard({ behavior: 'interacting_animal' })],
      });

      expect(screen.getByTestId('animal-select')).toBeInTheDocument();
      expect(screen.getByTestId('interaction-type-select')).toBeInTheDocument();
    });

    test('shows description field when behavior requires description (aggression)', () => {
      renderTimeSlotObservation({
        observations: [makeCard({ behavior: 'other' })],
      });

      expect(screen.getByTestId('description-field')).toBeInTheDocument();
    });
  });

  describe('Behavior Selection', () => {
    test('calls onChange and onValidate immediately when behavior changes', () => {
      renderTimeSlotObservation();

      const behaviorSelect = screen.getByTestId('behavior-select');
      fireEvent.change(behaviorSelect, { target: { value: 'perching' } });

      expect(mockOnChange).toHaveBeenCalledWith(
        '15:00',
        'card-sayyida',
        'behavior',
        'perching'
      );
      expect(mockOnValidate).toHaveBeenCalledWith(
        '15:00',
        'card-sayyida',
        'behavior',
        'perching'
      );
    });
  });

  describe('Location Input', () => {
    test('calls onChange and onValidate immediately when location changes', () => {
      renderTimeSlotObservation({
        observations: [makeCard({ behavior: 'preening' })],
      });

      const locationInput = screen.getByTestId('location-input');
      fireEvent.change(locationInput, { target: { value: '12' } });

      expect(mockOnChange).toHaveBeenCalledWith(
        '15:00',
        'card-sayyida',
        'location',
        '12'
      );
      expect(mockOnValidate).toHaveBeenCalledWith(
        '15:00',
        'card-sayyida',
        'location',
        '12'
      );
    });

    test('displays location error when present', () => {
      renderTimeSlotObservation({
        observations: [makeCard({ behavior: 'preening' })],
        fieldErrors: { '15:00_card-sayyida_location': 'Location is required' },
      });

      expect(screen.getByTestId('location-error')).toHaveTextContent(
        'Location is required'
      );
    });
  });

  describe('Object Selection', () => {
    test('calls onChange and onValidate immediately when object changes', () => {
      renderTimeSlotObservation({
        observations: [makeCard({ behavior: 'interacting_object' })],
      });

      const objectSelect = screen.getByTestId('object-select');
      fireEvent.change(objectSelect, { target: { value: 'newspaper' } });

      expect(mockOnChange).toHaveBeenCalledWith(
        '15:00',
        'card-sayyida',
        'object',
        'newspaper'
      );
      expect(mockOnValidate).toHaveBeenCalledWith(
        '15:00',
        'card-sayyida',
        'object',
        'newspaper'
      );
    });

    test('shows "other" text field when object is "other"', () => {
      renderTimeSlotObservation({
        observations: [
          makeCard({ behavior: 'interacting_object', object: 'other' }),
        ],
      });

      expect(screen.getByTestId('object-other')).toBeInTheDocument();
    });

    test('debounces validation for objectOther text input', async () => {
      renderTimeSlotObservation({
        observations: [
          makeCard({ behavior: 'interacting_object', object: 'other' }),
        ],
      });

      const objectOtherInput = screen.getByTestId('object-other');
      fireEvent.change(objectOtherInput, {
        target: { value: 'custom object' },
      });

      // onChange should be called immediately
      expect(mockOnChange).toHaveBeenCalledWith(
        '15:00',
        'card-sayyida',
        'objectOther',
        'custom object'
      );

      // onValidate should not be called yet
      expect(mockOnValidate).not.toHaveBeenCalled();

      // Fast forward 200ms for debounce
      jest.advanceTimersByTime(200);

      // Now onValidate should be called
      await waitFor(() => {
        expect(mockOnValidate).toHaveBeenCalledWith(
          '15:00',
          'card-sayyida',
          'objectOther',
          'custom object'
        );
      });
    });
  });

  describe('Animal and Interaction Type Selection', () => {
    test('calls onChange and onValidate immediately when animal changes', () => {
      renderTimeSlotObservation({
        observations: [makeCard({ behavior: 'interacting_animal' })],
      });

      const animalSelect = screen.getByTestId('animal-select');
      fireEvent.change(animalSelect, { target: { value: 'aviary_adult' } });

      expect(mockOnChange).toHaveBeenCalledWith(
        '15:00',
        'card-sayyida',
        'animal',
        'aviary_adult'
      );
      expect(mockOnValidate).toHaveBeenCalledWith(
        '15:00',
        'card-sayyida',
        'animal',
        'aviary_adult'
      );
    });

    test('calls onChange and onValidate immediately when interaction type changes', () => {
      renderTimeSlotObservation({
        observations: [makeCard({ behavior: 'interacting_animal' })],
      });

      const interactionTypeSelect = screen.getByTestId(
        'interaction-type-select'
      );
      fireEvent.change(interactionTypeSelect, {
        target: { value: 'watching' },
      });

      expect(mockOnChange).toHaveBeenCalledWith(
        '15:00',
        'card-sayyida',
        'animalInteractionType',
        'watching'
      );
      expect(mockOnValidate).toHaveBeenCalledWith(
        '15:00',
        'card-sayyida',
        'animalInteractionType',
        'watching'
      );
    });

    test('shows "other" fields when animal is "other"', () => {
      renderTimeSlotObservation({
        observations: [
          makeCard({ behavior: 'interacting_animal', animal: 'other' }),
        ],
      });

      expect(screen.getByTestId('animal-other')).toBeInTheDocument();
    });

    test('shows "other" field when interaction type is "other"', () => {
      renderTimeSlotObservation({
        observations: [
          makeCard({
            behavior: 'interacting_animal',
            animalInteractionType: 'other',
          }),
        ],
      });

      expect(screen.getByTestId('interaction-type-other')).toBeInTheDocument();
    });
  });

  describe('Description Field', () => {
    test('debounces validation for description text input', async () => {
      renderTimeSlotObservation({
        observations: [makeCard({ behavior: 'other' })],
      });

      const descriptionField = screen.getByTestId('description-field');
      fireEvent.change(descriptionField, {
        target: { value: 'Aggressive behavior' },
      });

      // onChange should be called immediately
      expect(mockOnChange).toHaveBeenCalledWith(
        '15:00',
        'card-sayyida',
        'description',
        'Aggressive behavior'
      );

      // onValidate should not be called yet
      expect(mockOnValidate).not.toHaveBeenCalled();

      // Fast forward 200ms for debounce
      jest.advanceTimersByTime(200);

      // Now onValidate should be called
      await waitFor(() => {
        expect(mockOnValidate).toHaveBeenCalledWith(
          '15:00',
          'card-sayyida',
          'description',
          'Aggressive behavior'
        );
      });
    });

    test('displays description error when present', () => {
      renderTimeSlotObservation({
        observations: [makeCard({ behavior: 'other' })],
        fieldErrors: {
          '15:00_card-sayyida_description': 'Description is required',
        },
      });

      expect(screen.getByTestId('description-error')).toHaveTextContent(
        'Description is required'
      );
    });
  });

  describe('Notes Field', () => {
    test('calls onChange when notes changes', () => {
      renderTimeSlotObservation();

      const notesField = screen.getByTestId('notes-field');
      fireEvent.change(notesField, { target: { value: 'Some notes' } });

      // Notes field onChange passes the event object directly
      expect(mockOnChange).toHaveBeenCalledWith(
        '15:00',
        'card-sayyida',
        'notes',
        'Some notes'
      );
    });
  });

  describe('Copy to Next Button', () => {
    test('calls onCopyToNext with correct time when clicked', () => {
      renderTimeSlotObservation();

      const copyButton = screen.getByText('Copy to next');
      fireEvent.click(copyButton);

      expect(mockOnCopyToNext).toHaveBeenCalledWith('15:00');
    });
  });

  describe('Error Display', () => {
    test('displays all error types when present via `${time}_${cardId}_${field}` keys', () => {
      renderTimeSlotObservation({
        observations: [
          makeCard({
            behavior: 'interacting_animal',
            object: 'other',
            animal: 'other',
            animalInteractionType: 'other',
          }),
        ],
        fieldErrors: {
          '15:00_card-sayyida_behavior': 'Behavior error',
          '15:00_card-sayyida_location': 'Location error',
          '15:00_card-sayyida_object': 'Object error',
          '15:00_card-sayyida_objectOther': 'Object other error',
          '15:00_card-sayyida_objectInteractionType':
            'Object interaction type error',
          '15:00_card-sayyida_objectInteractionTypeOther':
            'Object interaction type other error',
          '15:00_card-sayyida_animal': 'Animal error',
          '15:00_card-sayyida_animalOther': 'Animal other error',
          '15:00_card-sayyida_animalInteractionType':
            'Animal interaction type error',
          '15:00_card-sayyida_animalInteractionTypeOther':
            'Animal interaction type other error',
        },
      });

      expect(screen.getByTestId('behavior-error')).toHaveTextContent(
        'Behavior error'
      );
      expect(screen.getByTestId('animal-error')).toHaveTextContent(
        'Animal error'
      );
      expect(screen.getByTestId('animal-other-error')).toHaveTextContent(
        'Animal other error'
      );
      expect(screen.getByTestId('interaction-type-error')).toHaveTextContent(
        'Animal interaction type error'
      );
      expect(
        screen.getByTestId('interaction-type-other-error')
      ).toHaveTextContent('Animal interaction type other error');
    });

    test("does not display another card's error on this card", () => {
      renderTimeSlotObservation({
        observations: [makeCard({ behavior: 'preening' })],
        fieldErrors: { '15:00_card-chick_location': 'Location error' },
      });

      expect(screen.queryByTestId('location-error')).not.toBeInTheDocument();
    });
  });
});
