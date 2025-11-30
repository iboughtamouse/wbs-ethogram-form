/**
 * Unit tests for downloadService
 *
 * Tests Excel download from backend and local generation
 */

import { downloadFromBackend, downloadLocally } from '../downloadService';
import * as excelGenerator from '../export/excelGenerator';

// Mock excelGenerator
jest.mock('../export/excelGenerator');

// Mock global fetch
global.fetch = jest.fn();

describe('downloadService', () => {
  const mockObservationId = 'test-observation-123';
  const mockFormData = {
    metadata: {
      observerName: 'Test Observer',
      date: '2025-11-30',
      startTime: '15:00',
      endTime: '15:30',
      aviary: "Sayyida's Cove",
      patient: 'Sayyida',
      mode: 'live',
    },
    observations: {
      '15:00': { behavior: 'perching', location: '5', notes: '' },
    },
  };

  // Store original methods to restore
  let originalCreateObjectURL;
  let originalRevokeObjectURL;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock excelGenerator
    excelGenerator.generateExcelWorkbook.mockResolvedValue({
      xlsx: {
        writeBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
      },
    });

    // Store and mock URL methods
    originalCreateObjectURL = window.URL.createObjectURL;
    originalRevokeObjectURL = window.URL.revokeObjectURL;
    window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    window.URL.revokeObjectURL = jest.fn();

    // Mock global fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    // Restore original URL methods
    window.URL.createObjectURL = originalCreateObjectURL;
    window.URL.revokeObjectURL = originalRevokeObjectURL;
    jest.restoreAllMocks();
  });

  describe('downloadFromBackend', () => {
    let mockLink;
    let consoleErrorSpy;

    beforeEach(() => {
      // Create mock link element
      mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };

      // Mock DOM methods
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});

      // Suppress console.error for tests that verify error handling
      consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should download Excel file from backend successfully', async () => {
      const mockBlob = new Blob(['mock excel data'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      global.fetch.mockResolvedValueOnce({
        ok: true,
        blob: jest.fn().mockResolvedValue(mockBlob),
      });

      await downloadFromBackend(mockObservationId);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/observations/test-observation-123/excel'
      );
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockLink.download).toBe(
        'ethogram-observation-test-observation-123.xlsx'
      );
    });

    it('should create download link with correct filename', async () => {
      const mockBlob = new Blob(['mock data']);

      global.fetch.mockResolvedValueOnce({
        ok: true,
        blob: jest.fn().mockResolvedValue(mockBlob),
      });

      await downloadFromBackend(mockObservationId);

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockLink.download).toBe(
        'ethogram-observation-test-observation-123.xlsx'
      );
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should throw error if backend returns non-ok response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(downloadFromBackend(mockObservationId)).rejects.toThrow(
        'Download failed: Not Found'
      );
    });

    it('should throw error if network request fails', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(downloadFromBackend(mockObservationId)).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle missing observationId', async () => {
      await expect(downloadFromBackend(null)).rejects.toThrow();
    });

    it('should cleanup blob URL after download', async () => {
      const mockBlob = new Blob(['mock data']);
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => null },
        blob: jest.fn().mockResolvedValue(mockBlob),
      });

      await downloadFromBackend(mockObservationId);

      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('downloadLocally', () => {
    let mockLink;
    let consoleErrorSpy;

    beforeEach(() => {
      // Create mock link element
      mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };

      // Mock DOM methods
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});

      // Suppress console.error for error handling tests
      consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should generate and download Excel file locally', async () => {
      await downloadLocally(mockFormData, false);

      // When isOffline is false, generateExcelWorkbook is called with original data
      expect(excelGenerator.generateExcelWorkbook).toHaveBeenCalledWith(
        mockFormData
      );
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should add offline notice when isOffline flag is true', async () => {
      await downloadLocally(mockFormData, true);

      // When isOffline is true, data is modified to include offlineNotice
      expect(excelGenerator.generateExcelWorkbook).toHaveBeenCalledWith({
        ...mockFormData,
        metadata: {
          ...mockFormData.metadata,
          offlineNotice: 'Generated offline - not submitted to WBS',
        },
      });
      expect(mockLink.download).toMatch(/^offline-observation-/);
    });

    it('should use correct filename format', async () => {
      await downloadLocally(mockFormData, false);

      // Filename format: ethogram-observation-<ISO timestamp>.xlsx
      // ISO timestamp has colons and periods replaced with hyphens
      expect(mockLink.download).toMatch(
        /^ethogram-observation-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.xlsx$/
      );
    });

    it('should cleanup blob URL after download', async () => {
      await downloadLocally(mockFormData, false);

      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should throw error if workbook generation fails', async () => {
      excelGenerator.generateExcelWorkbook.mockRejectedValueOnce(
        new Error('Workbook generation failed')
      );

      await expect(downloadLocally(mockFormData, false)).rejects.toThrow(
        'Workbook generation failed'
      );
    });

    it('should throw error if writeBuffer fails', async () => {
      const mockWorkbookWithError = {
        xlsx: {
          writeBuffer: jest
            .fn()
            .mockRejectedValueOnce(new Error('Buffer write failed')),
        },
      };

      excelGenerator.generateExcelWorkbook.mockResolvedValueOnce(
        mockWorkbookWithError
      );

      await expect(downloadLocally(mockFormData, false)).rejects.toThrow(
        'Buffer write failed'
      );
    });
  });

  describe('Integration scenarios', () => {
    let consoleErrorSpy;

    beforeEach(() => {
      consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should handle backend unavailable fallback to local', async () => {
      // Simulate backend download failure
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      // Verify backend throws
      await expect(downloadFromBackend(mockObservationId)).rejects.toThrow();

      // Verify local download still works (DOM is already mocked in beforeEach)
      await expect(downloadLocally(mockFormData, true)).resolves.not.toThrow();
    });
  });
});
