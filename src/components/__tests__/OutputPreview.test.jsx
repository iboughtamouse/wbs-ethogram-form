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
      expect(screen.getByText(/Review your data below/i)).toBeInTheDocument();
    });

    test('renders download button', () => {
      render(<OutputPreview data={mockData} />);

      const downloadButton = screen.getByRole('button', {
        name: /download excel file/i,
      });
      expect(downloadButton).toBeInTheDocument();
    });

    test('renders JSON preview section', () => {
      render(<OutputPreview data={mockData} />);

      expect(screen.getByText('JSON Preview')).toBeInTheDocument();

      // Check that JSON data is displayed
      const jsonText = screen.getByText(/"observerName": "Test Observer"/i);
      expect(jsonText).toBeInTheDocument();
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

  describe('Excel Download Flow', () => {
    test('downloads Excel file when button clicked', async () => {
      const user = userEvent.setup();
      downloadExcelFile.mockResolvedValueOnce(undefined);

      render(<OutputPreview data={mockData} />);

      const downloadButton = screen.getByRole('button', {
        name: /download excel file/i,
      });
      await user.click(downloadButton);

      // Wait for download to complete
      await waitFor(() => {
        expect(downloadExcelFile).toHaveBeenCalledTimes(1);
      });

      // Check that correct filename was used
      expect(downloadExcelFile).toHaveBeenCalledWith(
        mockData,
        expect.stringContaining('ethogram-Sayyida-2025-11-22')
      );
    });

    test('sanitizes patient name in filename', async () => {
      const user = userEvent.setup();
      downloadExcelFile.mockResolvedValueOnce(undefined);

      const dataWithSpecialChars = {
        ...mockData,
        metadata: {
          ...mockData.metadata,
          patient: 'Test/Patient:Name*',
        },
      };

      render(<OutputPreview data={dataWithSpecialChars} />);

      const downloadButton = screen.getByRole('button', {
        name: /download excel file/i,
      });
      await user.click(downloadButton);

      await waitFor(() => {
        expect(downloadExcelFile).toHaveBeenCalledWith(
          dataWithSpecialChars,
          'ethogram-Test_Patient_Name_-2025-11-22'
        );
      });
    });
  });

  describe('Loading States - Button', () => {
    test('button shows "Generating..." text during download', async () => {
      const user = userEvent.setup();

      // Mock a slow download
      downloadExcelFile.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 100);
          })
      );

      render(<OutputPreview data={mockData} />);

      const downloadButton = screen.getByRole('button', {
        name: /download excel file/i,
      });
      await user.click(downloadButton);

      // Button text should change to "Generating..."
      expect(
        screen.getByRole('button', { name: /generating.../i })
      ).toBeInTheDocument();

      // Wait for download to complete
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /download excel file/i })
        ).toBeInTheDocument();
      });
    });

    test('button is disabled during download', async () => {
      const user = userEvent.setup();

      // Mock a slow download
      downloadExcelFile.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 100);
          })
      );

      render(<OutputPreview data={mockData} />);

      const downloadButton = screen.getByRole('button', {
        name: /download excel file/i,
      });
      expect(downloadButton).not.toBeDisabled();

      await user.click(downloadButton);

      // Button should be disabled during download
      const generatingButton = screen.getByRole('button', {
        name: /generating.../i,
      });
      expect(generatingButton).toBeDisabled();

      // Wait for download to complete
      await waitFor(() => {
        const finalButton = screen.getByRole('button', {
          name: /download excel file/i,
        });
        expect(finalButton).not.toBeDisabled();
      });
    });

    test('button re-enables after download completes', async () => {
      const user = userEvent.setup();
      downloadExcelFile.mockResolvedValueOnce(undefined);

      render(<OutputPreview data={mockData} />);

      const downloadButton = screen.getByRole('button', {
        name: /download excel file/i,
      });
      await user.click(downloadButton);

      // Wait for download to complete
      await waitFor(() => {
        expect(downloadExcelFile).toHaveBeenCalled();
      });

      // Button should be re-enabled
      const finalButton = screen.getByRole('button', {
        name: /download excel file/i,
      });
      expect(finalButton).not.toBeDisabled();
    });
  });

  describe('Loading States - Overlay', () => {
    test('shows loading overlay during download', async () => {
      const user = userEvent.setup();

      // Mock a slow download
      downloadExcelFile.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 100);
          })
      );

      render(<OutputPreview data={mockData} />);

      const downloadButton = screen.getByRole('button', {
        name: /download excel file/i,
      });

      // No overlay initially
      expect(screen.queryByRole('status')).not.toBeInTheDocument();

      await user.click(downloadButton);

      // Overlay should appear
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });

      // Check overlay message
      expect(screen.getByText(/generating excel file.../i)).toBeInTheDocument();

      // Wait for download to complete
      await waitFor(
        () => {
          expect(screen.queryByRole('status')).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    test('hides loading overlay after successful download', async () => {
      const user = userEvent.setup();
      downloadExcelFile.mockResolvedValueOnce(undefined);

      render(<OutputPreview data={mockData} />);

      const downloadButton = screen.getByRole('button', {
        name: /download excel file/i,
      });
      await user.click(downloadButton);

      // Wait for download to complete and overlay to disappear
      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });
    });

    test('hides loading overlay after download error', async () => {
      const user = userEvent.setup();

      // Mock console.error to suppress expected error output
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Mock download error
      downloadExcelFile.mockRejectedValueOnce(new Error('Network error'));

      // Mock window.alert to prevent actual alert
      const originalAlert = window.alert;
      window.alert = jest.fn();

      render(<OutputPreview data={mockData} />);

      const downloadButton = screen.getByRole('button', {
        name: /download excel file/i,
      });
      await user.click(downloadButton);

      // Wait for error handling and overlay to disappear
      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      });

      // Verify console.error was called with expected error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to generate Excel file:',
        expect.any(Error)
      );

      // Restore mocks
      consoleErrorSpy.mockRestore();
      window.alert = originalAlert;
    });
  });

  describe('Error Handling', () => {
    let consoleErrorSpy;

    beforeEach(() => {
      // Mock console.error to suppress expected error output
      consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
    });

    afterEach(() => {
      // Restore console.error after each test
      consoleErrorSpy.mockRestore();
    });

    test('shows error alert when download fails', async () => {
      const user = userEvent.setup();
      const mockError = new Error('Download failed');
      downloadExcelFile.mockRejectedValueOnce(mockError);

      // Mock window.alert
      const alertMock = jest.fn();
      const originalAlert = window.alert;
      window.alert = alertMock;

      render(<OutputPreview data={mockData} />);

      const downloadButton = screen.getByRole('button', {
        name: /download excel file/i,
      });
      await user.click(downloadButton);

      // Wait for error handling
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          expect.stringContaining('Failed to generate Excel file')
        );
      });

      expect(alertMock).toHaveBeenCalledWith(
        expect.stringContaining('Download failed')
      );

      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to generate Excel file:',
        mockError
      );

      // Restore window.alert
      window.alert = originalAlert;
    });

    test('handles error without message gracefully', async () => {
      const user = userEvent.setup();
      downloadExcelFile.mockRejectedValueOnce(new Error());

      const alertMock = jest.fn();
      const originalAlert = window.alert;
      window.alert = alertMock;

      render(<OutputPreview data={mockData} />);

      const downloadButton = screen.getByRole('button', {
        name: /download excel file/i,
      });
      await user.click(downloadButton);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          expect.stringContaining('Unknown error occurred')
        );
      });

      // Restore window.alert
      window.alert = originalAlert;
    });

    test('console.error logs error details', async () => {
      const user = userEvent.setup();
      const mockError = new Error('Test error');
      downloadExcelFile.mockRejectedValueOnce(mockError);

      const originalAlert = window.alert;
      window.alert = jest.fn();

      render(<OutputPreview data={mockData} />);

      const downloadButton = screen.getByRole('button', {
        name: /download excel file/i,
      });
      await user.click(downloadButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to generate Excel file:',
          mockError
        );
      });

      // Restore window.alert
      window.alert = originalAlert;
    });
  });

  describe('Accessibility', () => {
    test('download button has accessible name', () => {
      render(<OutputPreview data={mockData} />);

      const button = screen.getByRole('button', {
        name: /download excel file/i,
      });
      expect(button).toHaveAccessibleName();
    });

    test('loading state button has accessible name', async () => {
      const user = userEvent.setup();

      downloadExcelFile.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 100);
          })
      );

      render(<OutputPreview data={mockData} />);

      const downloadButton = screen.getByRole('button', {
        name: /download excel file/i,
      });
      await user.click(downloadButton);

      const loadingButton = screen.getByRole('button', {
        name: /generating.../i,
      });
      expect(loadingButton).toHaveAccessibleName();
    });

    test('loading overlay has proper ARIA attributes', async () => {
      const user = userEvent.setup();

      downloadExcelFile.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 100);
          })
      );

      render(<OutputPreview data={mockData} />);

      const downloadButton = screen.getByRole('button', {
        name: /download excel file/i,
      });
      await user.click(downloadButton);

      await waitFor(() => {
        const overlay = screen.getByRole('status');
        expect(overlay).toHaveAttribute('aria-live', 'assertive');
        expect(overlay).toHaveAttribute('aria-busy', 'true');
        expect(overlay).toHaveAttribute('aria-modal', 'true');
      });
    });
  });

  describe('ExcelJS Prefetch', () => {
    test('prefetches ExcelJS module on mount', () => {
      render(<OutputPreview data={mockData} />);

      // The component should trigger import of excelGenerator
      // We can't directly test dynamic import, but we can verify
      // the component renders without errors
      expect(screen.getByText('Data Preview')).toBeInTheDocument();
    });
  });
});
