import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OutputPreview from '../OutputPreview';

// Mock the Excel generator module
jest.mock('../../services/export/excelGenerator', () => ({
  downloadExcelFile: jest.fn(),
}));

// Import the mocked module
import { downloadExcelFile } from '../../services/export/excelGenerator';

describe('OutputPreview', () => {
  const mockData = {
    metadata: {
      observerName: 'Test Observer',
      date: '2025-11-22',
      startTime: '15:00',
      endTime: '15:30',
      aviary: "Sayyida's Cove",
      patient: 'Sayyida',
      mode: 'live',
    },
    observations: {
      '15:00': {
        behavior: 'resting_alert',
        location: '5',
        notes: 'Test note',
        description: '',
        object: '',
        objectOther: '',
        animal: '',
        animalOther: '',
        interactionType: '',
        interactionTypeOther: '',
      },
    },
    submittedAt: '2025-11-22T15:30:00.000Z',
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders component with data', () => {
      render(<OutputPreview data={mockData} />);

      expect(screen.getByText('Data Preview')).toBeInTheDocument();
      expect(screen.getByText(/ready for submission/i)).toBeInTheDocument();
    });

    test('renders JSON preview section in collapsible details', () => {
      render(<OutputPreview data={mockData} />);

      // JSON preview is now in a collapsible <details> element
      expect(
        screen.getByText(/Show JSON Preview \(for debugging\)/i)
      ).toBeInTheDocument();

      // JSON data is initially hidden (details is closed by default)
      const { container } = render(<OutputPreview data={mockData} />);
      const preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
    });

    test('displays formatted JSON with proper indentation', () => {
      const { container } = render(<OutputPreview data={mockData} />);

      const preElement = container.querySelector('pre');
      expect(preElement).toBeInTheDocument();
      expect(preElement.textContent).toContain(
        JSON.stringify(mockData, null, 2)
      );
    });
  });

  // NOTE: Download functionality has been moved to SubmissionModal
});
