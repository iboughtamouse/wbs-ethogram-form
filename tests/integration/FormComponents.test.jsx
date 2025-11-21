import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  BehaviorSelect,
  LocationInput,
  ObjectSelect,
  AnimalSelect,
  InteractionTypeSelect,
  DescriptionField,
  NotesField
} from '../../src/components/form';

describe('Form Components', () => {
  describe('BehaviorSelect', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
      mockOnChange.mockClear();
    });

    test('renders with default empty value', () => {
      render(<BehaviorSelect value="" onChange={mockOnChange} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('');
    });

    test('renders with provided value', () => {
      render(<BehaviorSelect value="preening" onChange={mockOnChange} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('preening');
    });

    test('calls onChange when value changes', () => {
      render(<BehaviorSelect value="" onChange={mockOnChange} />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'eating_food_platform' } });

      expect(mockOnChange).toHaveBeenCalledWith('eating_food_platform');
    });

    test('displays error when provided', () => {
      render(<BehaviorSelect value="" onChange={mockOnChange} error="Behavior is required" />);

      expect(screen.getByText('Behavior is required')).toBeInTheDocument();
    });

    test('adds error class when error is present', () => {
      render(<BehaviorSelect value="" onChange={mockOnChange} error="Error" />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('error');
    });

    test('renders all behavior options from BEHAVIORS constant', () => {
      render(<BehaviorSelect value="" onChange={mockOnChange} />);

      // Check for a few key behaviors
      expect(screen.getByText('Select a behavior...')).toBeInTheDocument();
      expect(screen.getByText('Eating - On Food Platform')).toBeInTheDocument();
      expect(screen.getByText('Preening/Grooming')).toBeInTheDocument();
      expect(screen.getByText('Interacting with Inanimate Object')).toBeInTheDocument();
    });
  });

  describe('DescriptionField', () => {
    const mockOnChange = jest.fn();
    const mockOnKeyDown = jest.fn();

    beforeEach(() => {
      mockOnChange.mockClear();
      mockOnKeyDown.mockClear();
    });

    test('renders text input with value', () => {
      render(
        <DescriptionField
          value="Test description"
          onChange={mockOnChange}
          onKeyDown={mockOnKeyDown}
        />
      );

      const input = screen.getByPlaceholderText(/Describe the behavior/i);
      expect(input).toHaveValue('Test description');
    });

    test('calls onChange when text changes', () => {
      render(
        <DescriptionField
          value=""
          onChange={mockOnChange}
          onKeyDown={mockOnKeyDown}
        />
      );

      const input = screen.getByPlaceholderText(/Describe the behavior/i);
      fireEvent.change(input, { target: { value: 'New description' } });

      expect(mockOnChange).toHaveBeenCalled();
    });

    test('calls onKeyDown when key is pressed', () => {
      render(
        <DescriptionField
          value=""
          onChange={mockOnChange}
          onKeyDown={mockOnKeyDown}
        />
      );

      const input = screen.getByPlaceholderText(/Describe the behavior/i);
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockOnKeyDown).toHaveBeenCalled();
    });

    test('displays error when provided', () => {
      render(
        <DescriptionField
          value=""
          onChange={mockOnChange}
          onKeyDown={mockOnKeyDown}
          error="Description is required"
        />
      );

      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });

    test('adds error class when error is present', () => {
      render(
        <DescriptionField
          value=""
          onChange={mockOnChange}
          onKeyDown={mockOnKeyDown}
          error="Error"
        />
      );

      const input = screen.getByPlaceholderText(/Describe the behavior/i);
      expect(input).toHaveClass('error');
    });

    test('shows required asterisk', () => {
      render(
        <DescriptionField
          value=""
          onChange={mockOnChange}
          onKeyDown={mockOnKeyDown}
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('NotesField', () => {
    const mockOnChange = jest.fn();
    const mockOnKeyDown = jest.fn();

    beforeEach(() => {
      mockOnChange.mockClear();
      mockOnKeyDown.mockClear();
    });

    test('renders text input with value', () => {
      render(
        <NotesField
          value="Some notes"
          onChange={mockOnChange}
          onKeyDown={mockOnKeyDown}
        />
      );

      const input = screen.getByPlaceholderText(/Any additional observations/i);
      expect(input).toHaveValue('Some notes');
    });

    test('calls onChange when text changes', () => {
      render(
        <NotesField
          value=""
          onChange={mockOnChange}
          onKeyDown={mockOnKeyDown}
        />
      );

      const input = screen.getByPlaceholderText(/Any additional observations/i);
      fireEvent.change(input, { target: { value: 'New notes' } });

      expect(mockOnChange).toHaveBeenCalled();
    });

    test('is marked as optional (no required asterisk)', () => {
      render(
        <NotesField
          value=""
          onChange={mockOnChange}
          onKeyDown={mockOnKeyDown}
        />
      );

      expect(screen.getByText(/optional/i)).toBeInTheDocument();
    });
  });

  describe('ObjectSelect', () => {
    const mockOnChange = jest.fn();
    const mockOnOtherChange = jest.fn();
    const mockOnKeyDown = jest.fn();

    beforeEach(() => {
      mockOnChange.mockClear();
      mockOnOtherChange.mockClear();
      mockOnKeyDown.mockClear();
    });

    test('renders dropdown with value', () => {
      render(
        <ObjectSelect
          value="newspaper"
          otherValue=""
          onChange={mockOnChange}
          onOtherChange={mockOnOtherChange}
          onKeyDown={mockOnKeyDown}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('newspaper');
    });

    test('calls onChange when dropdown value changes', () => {
      render(
        <ObjectSelect
          value=""
          otherValue=""
          onChange={mockOnChange}
          onOtherChange={mockOnOtherChange}
          onKeyDown={mockOnKeyDown}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'food' } });

      expect(mockOnChange).toHaveBeenCalled();
    });

    test('shows "other" text field when value is "other"', () => {
      render(
        <ObjectSelect
          value="other"
          otherValue=""
          onChange={mockOnChange}
          onOtherChange={mockOnOtherChange}
          onKeyDown={mockOnKeyDown}
        />
      );

      expect(screen.getByPlaceholderText(/Enter object name/i)).toBeInTheDocument();
    });

    test('does not show "other" text field when value is not "other"', () => {
      render(
        <ObjectSelect
          value="newspaper"
          otherValue=""
          onChange={mockOnChange}
          onOtherChange={mockOnOtherChange}
          onKeyDown={mockOnKeyDown}
        />
      );

      expect(screen.queryByPlaceholderText(/Enter object name/i)).not.toBeInTheDocument();
    });

    test('calls onOtherChange when "other" text changes', () => {
      render(
        <ObjectSelect
          value="other"
          otherValue=""
          onChange={mockOnChange}
          onOtherChange={mockOnOtherChange}
          onKeyDown={mockOnKeyDown}
        />
      );

      const input = screen.getByPlaceholderText(/Enter object name/i);
      fireEvent.change(input, { target: { value: 'custom object' } });

      expect(mockOnOtherChange).toHaveBeenCalled();
    });

    test('displays dropdown error when provided', () => {
      render(
        <ObjectSelect
          value=""
          otherValue=""
          onChange={mockOnChange}
          onOtherChange={mockOnOtherChange}
          onKeyDown={mockOnKeyDown}
          error="Object is required"
        />
      );

      expect(screen.getByText('Object is required')).toBeInTheDocument();
    });

    test('displays "other" field error when provided', () => {
      render(
        <ObjectSelect
          value="other"
          otherValue=""
          onChange={mockOnChange}
          onOtherChange={mockOnOtherChange}
          onKeyDown={mockOnKeyDown}
          otherError="Please specify object"
        />
      );

      expect(screen.getByText('Please specify object')).toBeInTheDocument();
    });
  });

  describe('AnimalSelect', () => {
    const mockOnChange = jest.fn();
    const mockOnOtherChange = jest.fn();
    const mockOnKeyDown = jest.fn();

    beforeEach(() => {
      mockOnChange.mockClear();
      mockOnOtherChange.mockClear();
      mockOnKeyDown.mockClear();
    });

    test('renders dropdown with value', () => {
      render(
        <AnimalSelect
          value="adult_aviary_occupant"
          otherValue=""
          onChange={mockOnChange}
          onOtherChange={mockOnOtherChange}
          onKeyDown={mockOnKeyDown}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('adult_aviary_occupant');
    });

    test('shows "other" text field when value is "other"', () => {
      render(
        <AnimalSelect
          value="other"
          otherValue=""
          onChange={mockOnChange}
          onOtherChange={mockOnOtherChange}
          onKeyDown={mockOnKeyDown}
        />
      );

      expect(screen.getByPlaceholderText(/Enter animal type/i)).toBeInTheDocument();
    });

    test('calls onChange when dropdown value changes', () => {
      render(
        <AnimalSelect
          value=""
          otherValue=""
          onChange={mockOnChange}
          onOtherChange={mockOnOtherChange}
          onKeyDown={mockOnKeyDown}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'juvenile_aviary_occupant' } });

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('InteractionTypeSelect', () => {
    const mockOnChange = jest.fn();
    const mockOnOtherChange = jest.fn();
    const mockOnKeyDown = jest.fn();

    beforeEach(() => {
      mockOnChange.mockClear();
      mockOnOtherChange.mockClear();
      mockOnKeyDown.mockClear();
    });

    test('renders dropdown with value', () => {
      render(
        <InteractionTypeSelect
          value="watching"
          otherValue=""
          onChange={mockOnChange}
          onOtherChange={mockOnOtherChange}
          onKeyDown={mockOnKeyDown}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('watching');
    });

    test('shows "other" text field when value is "other"', () => {
      render(
        <InteractionTypeSelect
          value="other"
          otherValue=""
          onChange={mockOnChange}
          onOtherChange={mockOnOtherChange}
          onKeyDown={mockOnKeyDown}
        />
      );

      expect(screen.getByPlaceholderText(/Enter interaction type/i)).toBeInTheDocument();
    });

    test('calls onChange when dropdown value changes', () => {
      render(
        <InteractionTypeSelect
          value=""
          otherValue=""
          onChange={mockOnChange}
          onOtherChange={mockOnOtherChange}
          onKeyDown={mockOnKeyDown}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'feeding' } });

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('LocationInput', () => {
    const mockOnChange = jest.fn();

    const defaultProps = {
      value: '',
      onChange: mockOnChange,
      behaviorValue: 'perching',
      perchOptions: [
        {
          label: 'Common Locations',
          options: [{ value: 'Ground', label: 'Ground' }]
        }
      ],
      selectedLocationOption: null,
      selectStyles: {}
    };

    beforeEach(() => {
      mockOnChange.mockClear();
    });

    test('renders with location label for non-jumping behavior', () => {
      render(<LocationInput {...defaultProps} behaviorValue="preening" />);

      expect(screen.getByText(/^Location/)).toBeInTheDocument();
    });

    test('renders with "Starting Location" label for jumping behavior', () => {
      render(<LocationInput {...defaultProps} behaviorValue="jumping" />);

      expect(screen.getByText(/Starting Location/)).toBeInTheDocument();
    });

    test('renders map button', () => {
      render(<LocationInput {...defaultProps} />);

      expect(screen.getByText(/Map/)).toBeInTheDocument();
    });

    test('opens perch diagram modal when map button is clicked', () => {
      render(<LocationInput {...defaultProps} />);

      const mapButton = screen.getByText(/Map/);
      fireEvent.click(mapButton);

      // Modal should be rendered (checking for modal title and tabs)
      expect(screen.getByText('Perch Reference')).toBeInTheDocument();
      expect(screen.getByText(/NE Half/)).toBeInTheDocument();
      expect(screen.getByText(/SW Half/)).toBeInTheDocument();
    });

    test('closes modal when close button is clicked', () => {
      render(<LocationInput {...defaultProps} />);

      // Open modal
      const mapButton = screen.getByText(/Map/);
      fireEvent.click(mapButton);

      // Close modal using aria-label
      const closeButton = screen.getByLabelText(/Close perch diagram/);
      fireEvent.click(closeButton);

      // Modal should be gone
      expect(screen.queryByText('Perch Reference')).not.toBeInTheDocument();
    });

    test('displays error when provided', () => {
      render(<LocationInput {...defaultProps} error="Location is required" />);

      expect(screen.getByText('Location is required')).toBeInTheDocument();
    });

    test('shows required asterisk', () => {
      render(<LocationInput {...defaultProps} />);

      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });
});
