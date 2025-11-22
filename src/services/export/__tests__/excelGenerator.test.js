import { generateExcelWorkbook, downloadExcelFile } from '../excelGenerator';
import ExcelJS from 'exceljs';

describe('excelGenerator', () => {
  // Helper function to find row index for a specific behavior
  const findBehaviorRow = (worksheet, behaviorText) => {
    const rows = worksheet.getRows(5, 25);
    let foundRow = null;

    rows.forEach((row, index) => {
      if (
        row.getCell(1).value &&
        row.getCell(1).value.toString().includes(behaviorText)
      ) {
        foundRow = 5 + index;
      }
    });

    return foundRow;
  };

  describe('generateExcelWorkbook', () => {
    const mockFormData = {
      metadata: {
        observerName: 'John Doe',
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '09:15',
        aviary: "Sayyida's Cove",
        patient: 'Sayyida',
        mode: 'live',
      },
      observations: {
        '09:00': {
          behavior: 'eating_food_platform',
          location: '',
          notes: '',
          object: '',
          objectOther: '',
          animal: '',
          animalOther: '',
          interactionType: '',
          interactionTypeOther: '',
          description: '',
        },
        '09:05': {
          behavior: 'preening',
          location: '3',
          notes: 'Very focused',
          object: '',
          objectOther: '',
          animal: '',
          animalOther: '',
          interactionType: '',
          interactionTypeOther: '',
          description: '',
        },
        '09:10': {
          behavior: 'interacting_object',
          location: '',
          notes: '',
          object: 'toy',
          objectOther: '',
          animal: '',
          animalOther: '',
          interactionType: '',
          interactionTypeOther: '',
          description: 'Playing with toy',
        },
      },
      submittedAt: '2025-01-15T09:20:00.000Z',
    };

    it('should return an ExcelJS workbook instance', async () => {
      const workbook = await generateExcelWorkbook(mockFormData);

      expect(workbook).toBeInstanceOf(ExcelJS.Workbook);
    });

    it('should create a worksheet with correct name', async () => {
      const workbook = await generateExcelWorkbook(mockFormData);
      const worksheet = workbook.getWorksheet(1);

      expect(worksheet).toBeDefined();
      expect(worksheet.name).toBe('Ethogram Data');
    });

    it('should include metadata in header rows', async () => {
      const workbook = await generateExcelWorkbook(mockFormData);
      const worksheet = workbook.getWorksheet(1);

      // Row 1: Title, Date, Time Window
      expect(worksheet.getCell('A1').value).toBe(
        'Rehabilitation Raptor Ethogram'
      );
      expect(worksheet.getCell('B1').value).toBe('Date:');
      expect(worksheet.getCell('C1').value).toBe('2025-01-15');
      expect(worksheet.getCell('J1').value).toBe('Time Window:');
      expect(worksheet.getCell('K1').value).toBe('09:00 - 09:15');

      // Row 2: Aviary, Patient, Observer
      expect(worksheet.getCell('A2').value).toContain("Aviary: Sayyida's Cove");
      expect(worksheet.getCell('B2').value).toContain('Patient(s): Sayyida');
      expect(worksheet.getCell('J2').value).toBe('Observer:');
      expect(worksheet.getCell('K2').value).toBe('John Doe');

      // Row 3: "Time:" label
      expect(worksheet.getCell('B3').value).toBe('Time:');
    });

    it('should include time slot headers in row 4', async () => {
      const workbook = await generateExcelWorkbook(mockFormData);
      const worksheet = workbook.getWorksheet(1);

      // Time slots start at column B (column 2)
      expect(worksheet.getCell('B4').value).toBe('0:00');
      expect(worksheet.getCell('C4').value).toBe('0:05');
      expect(worksheet.getCell('D4').value).toBe('0:10');
    });

    it('should place behavior labels in column A starting at row 5', async () => {
      const workbook = await generateExcelWorkbook(mockFormData);
      const worksheet = workbook.getWorksheet(1);

      // Check first few behavior labels
      expect(worksheet.getCell('A5').value).toBe('Eating - On Food Platform');
      expect(worksheet.getCell('A6').value).toContain('Eating - Elsewhere');
      expect(worksheet.getCell('A7').value).toContain(
        'Locomotion - Walking on Ground'
      );
    });

    it('should mark observed behaviors with "x"', async () => {
      const workbook = await generateExcelWorkbook(mockFormData);
      const worksheet = workbook.getWorksheet(1);

      // 09:00 -> 0:00 (column B), eating_food_platform (row 5)
      const cell1 = worksheet.getCell('B5');
      expect(cell1.value).toBe('x');

      // 09:05 -> 0:05 (column C), preening (row should be calculated)
      // Need to find the preening row - it's around row 14 based on the screenshot
    });

    it('should include location and notes in cell when present', async () => {
      const workbook = await generateExcelWorkbook(mockFormData);
      const worksheet = workbook.getWorksheet(1);

      // 09:05 has preening with location 3 and notes
      // Find the cell and check it contains location info
      const rows = worksheet.getRows(5, 25);
      let preeningRow = null;

      rows.forEach((row, index) => {
        const cellValue = row.getCell(1).value;
        if (
          cellValue &&
          cellValue.toString().includes('Preening') &&
          !cellValue.toString().includes('Repetitive')
        ) {
          preeningRow = 5 + index;
        }
      });

      expect(preeningRow).not.toBeNull();
      if (preeningRow) {
        const cell = worksheet.getCell(`C${preeningRow}`);
        expect(cell.value).toBeTruthy();
        expect(cell.value).toContain('Loc: 3');
        expect(cell.value).toContain('Notes: Very focused');
      }
    });

    it('should include object/interaction details when present', async () => {
      const workbook = await generateExcelWorkbook(mockFormData);
      const worksheet = workbook.getWorksheet(1);

      // 09:10 has interaction-inanimate with object toy
      const rows = worksheet.getRows(5, 25);
      let interactionRow = null;

      rows.forEach((row, index) => {
        if (
          row.getCell(1).value &&
          row.getCell(1).value.toString().includes('Interacting with Inanimate')
        ) {
          interactionRow = 5 + index;
        }
      });

      expect(interactionRow).not.toBeNull();
      if (interactionRow) {
        const cell = worksheet.getCell(`D${interactionRow}`);
        expect(cell.value).toContain('Object: toy');
        expect(cell.value).toContain('Description: Playing with toy');
      }
    });

    it('should handle empty observations gracefully', async () => {
      const emptyData = {
        metadata: {
          observerName: 'Jane Doe',
          date: '2025-01-16',
          startTime: '10:00',
          endTime: '10:10',
          aviary: "Sayyida's Cove",
          patient: 'Sayyida',
          mode: 'live',
        },
        observations: {},
        submittedAt: '2025-01-16T10:15:00.000Z',
      };

      const workbook = await generateExcelWorkbook(emptyData);
      const worksheet = workbook.getWorksheet(1);

      // Should still have metadata and structure
      expect(worksheet.getCell('A1').value).toBe(
        'Rehabilitation Raptor Ethogram'
      );
      expect(worksheet.getCell('K2').value).toBe('Jane Doe');
    });

    it('should handle VOD mode correctly', async () => {
      const vodData = {
        ...mockFormData,
        metadata: {
          ...mockFormData.metadata,
          mode: 'vod',
          startTime: '14:30',
          endTime: '14:45',
        },
      };

      const workbook = await generateExcelWorkbook(vodData);
      const worksheet = workbook.getWorksheet(1);

      // VOD mode should show original times (not converted)
      expect(worksheet.getCell('K1').value).toBe('14:30 - 14:45');
    });

    it('should add comments section at bottom', async () => {
      const workbook = await generateExcelWorkbook(mockFormData);
      const worksheet = workbook.getWorksheet(1);

      // Comments should be after all behavior rows
      // Assuming ~25 behaviors, comments would be around row 30
      const rows = worksheet.getRows(25, 10);
      let hasCommentsSection = false;

      rows.forEach((row) => {
        const cellValue = row.getCell(1).value;
        if (cellValue && cellValue.toString().includes('Comments')) {
          hasCommentsSection = true;
        }
      });

      expect(hasCommentsSection).toBe(true);
    });

    it('should convert time slots to relative format (0:00, 0:05, etc)', async () => {
      const workbook = await generateExcelWorkbook(mockFormData);
      const worksheet = workbook.getWorksheet(1);

      // 09:00 start time should become 0:00
      expect(worksheet.getCell('B4').value).toBe('0:00');
      // 09:05 should become 0:05
      expect(worksheet.getCell('C4').value).toBe('0:05');
      // 09:10 should become 0:10
      expect(worksheet.getCell('D4').value).toBe('0:10');
    });

    it('should handle hour-long observations correctly', async () => {
      const longData = {
        metadata: {
          observerName: 'Observer',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '10:00',
          aviary: "Sayyida's Cove",
          patient: 'Sayyida',
          mode: 'live',
        },
        observations: {
          '09:00': {
            behavior: 'flying',
            location: '',
            notes: '',
            object: '',
            objectOther: '',
            animal: '',
            animalOther: '',
            interactionType: '',
            interactionTypeOther: '',
            description: '',
          },
          '09:55': {
            behavior: 'resting_alert',
            location: '5',
            notes: '',
            object: '',
            objectOther: '',
            animal: '',
            animalOther: '',
            interactionType: '',
            interactionTypeOther: '',
            description: '',
          },
        },
        submittedAt: '2025-01-15T10:05:00.000Z',
      };

      const workbook = await generateExcelWorkbook(longData);
      const worksheet = workbook.getWorksheet(1);

      // Should have columns for all 5-minute intervals
      expect(worksheet.getCell('B4').value).toBe('0:00');
      expect(worksheet.getCell('M4').value).toBe('0:55'); // 12th column (B + 11)
    });

    it('should handle midnight crossing observations (23:55 to 00:00)', async () => {
      const midnightData = {
        metadata: {
          observerName: 'Night Observer',
          date: '2025-01-15',
          startTime: '23:55',
          endTime: '00:00',
          aviary: "Sayyida's Cove",
          patient: 'Sayyida',
          mode: 'live',
        },
        observations: {
          '23:55': {
            behavior: 'resting_alert',
            location: '1',
            notes: 'Before midnight',
            object: '',
            objectOther: '',
            animal: '',
            animalOther: '',
            interactionType: '',
            interactionTypeOther: '',
            description: '',
          },
          '00:00': {
            behavior: 'vocalizing',
            location: '',
            notes: 'After midnight',
            object: '',
            objectOther: '',
            animal: '',
            animalOther: '',
            interactionType: '',
            interactionTypeOther: '',
            description: '',
          },
        },
        submittedAt: '2025-01-16T00:05:00.000Z',
      };

      const workbook = await generateExcelWorkbook(midnightData);
      const worksheet = workbook.getWorksheet(1);

      // Time window should show actual times
      expect(worksheet.getCell('K1').value).toBe('23:55 - 00:00');

      // Relative time headers should show 0:00 and 0:05
      expect(worksheet.getCell('B4').value).toBe('0:00');
      expect(worksheet.getCell('C4').value).toBe('0:05');

      // Both observations should be marked
      const rows = worksheet.getRows(5, 25);
      let restingRow = null;
      let vocalizingRow = null;

      rows.forEach((row, index) => {
        const cellValue = row.getCell(1).value;
        if (cellValue) {
          if (
            cellValue.toString().includes('Resting on Perch/Ground - Alert')
          ) {
            restingRow = 5 + index;
          }
          if (cellValue.toString().includes('Vocalizing')) {
            vocalizingRow = 5 + index;
          }
        }
      });

      expect(restingRow).not.toBeNull();
      expect(vocalizingRow).not.toBeNull();

      // Check that observations are in the right columns
      if (restingRow) {
        const cell = worksheet.getCell(restingRow, 2); // Column B = 23:55 = 0:00
        expect(cell.value).toBeTruthy();
        expect(cell.value).toContain('Loc: 1');
      }

      if (vocalizingRow) {
        const cell = worksheet.getCell(vocalizingRow, 3); // Column C = 00:00 = 0:05
        expect(cell.value).toBeTruthy();
      }
    });

    it('should handle midnight crossing with full hour (23:30 to 00:30)', async () => {
      const fullHourData = {
        metadata: {
          observerName: 'Night Observer',
          date: '2025-01-15',
          startTime: '23:30',
          endTime: '00:30',
          aviary: "Sayyida's Cove",
          patient: 'Sayyida',
          mode: 'live',
        },
        observations: {},
        submittedAt: '2025-01-16T00:35:00.000Z',
      };

      const workbook = await generateExcelWorkbook(fullHourData);
      const worksheet = workbook.getWorksheet(1);

      // Should have 13 time slots (0:00, 0:05, ..., 1:00)
      expect(worksheet.getCell('B4').value).toBe('0:00');
      expect(worksheet.getCell('G4').value).toBe('0:25'); // 6th column (23:55)
      expect(worksheet.getCell('H4').value).toBe('0:30'); // 7th column (00:00)
      expect(worksheet.getCell('M4').value).toBe('0:55'); // 12th column (00:25)
      expect(worksheet.getCell('N4').value).toBe('1:00'); // 13th column (00:30)
    });

    it('should handle "other" animal value correctly', async () => {
      const dataWithOtherAnimal = {
        metadata: {
          observerName: 'Observer',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '09:10',
          aviary: "Sayyida's Cove",
          patient: 'Sayyida',
          mode: 'live',
        },
        observations: {
          '09:00': {
            behavior: 'interacting_animal',
            location: '',
            notes: '',
            object: '',
            objectOther: '',
            animal: 'other',
            animalOther: 'squirrel',
            interactionType: 'watching',
            interactionTypeOther: '',
            description: '',
          },
        },
        submittedAt: '2025-01-15T09:15:00.000Z',
      };

      const workbook = await generateExcelWorkbook(dataWithOtherAnimal);
      const worksheet = workbook.getWorksheet(1);

      const animalRow = findBehaviorRow(
        worksheet,
        'Interacting with Other Animal'
      );

      expect(animalRow).not.toBeNull();
      if (animalRow) {
        const cell = worksheet.getCell(animalRow, 2); // Column B = 09:00
        expect(cell.value).toContain('Animal: squirrel');
        expect(cell.value).not.toContain('Animal: other');
      }
    });

    it('should handle "other" interaction type correctly', async () => {
      const dataWithOtherInteraction = {
        metadata: {
          observerName: 'Observer',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '09:10',
          aviary: "Sayyida's Cove",
          patient: 'Sayyida',
          mode: 'live',
        },
        observations: {
          '09:00': {
            behavior: 'interacting_animal',
            location: '',
            notes: '',
            object: '',
            objectOther: '',
            animal: 'insect',
            animalOther: '',
            interactionType: 'other',
            interactionTypeOther: 'chasing',
            description: '',
          },
        },
        submittedAt: '2025-01-15T09:15:00.000Z',
      };

      const workbook = await generateExcelWorkbook(dataWithOtherInteraction);
      const worksheet = workbook.getWorksheet(1);

      const animalRow = findBehaviorRow(
        worksheet,
        'Interacting with Other Animal'
      );

      expect(animalRow).not.toBeNull();
      if (animalRow) {
        const cell = worksheet.getCell(animalRow, 2); // Column B = 09:00
        expect(cell.value).toContain('Interaction: chasing');
        expect(cell.value).not.toContain('Interaction: other');
      }
    });
  });

  describe('downloadExcelFile', () => {
    const mockFormData = {
      metadata: {
        observerName: 'Test User',
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '09:10',
        aviary: "Sayyida's Cove",
        patient: 'Sayyida',
        mode: 'live',
      },
      observations: {
        '09:00': {
          behavior: 'resting_alert',
          location: '5',
          notes: '',
          object: '',
          objectOther: '',
          animal: '',
          animalOther: '',
          interactionType: '',
          interactionTypeOther: '',
          description: '',
        },
      },
      submittedAt: '2025-01-15T09:15:00.000Z',
    };

    // Mock DOM APIs
    let mockLink;
    let mockCreateObjectURL;
    let mockRevokeObjectURL;
    let originalCreateObjectURL;
    let originalRevokeObjectURL;

    beforeEach(() => {
      // Mock link element
      mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };

      // Mock document.createElement
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink);

      // Mock document.body methods
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});

      // Store original URL methods and mock them
      originalCreateObjectURL = window.URL.createObjectURL;
      originalRevokeObjectURL = window.URL.revokeObjectURL;
      mockCreateObjectURL = jest.fn().mockReturnValue('blob:mock-url');
      mockRevokeObjectURL = jest.fn();
      window.URL.createObjectURL = mockCreateObjectURL;
      window.URL.revokeObjectURL = mockRevokeObjectURL;
    });

    afterEach(() => {
      // Restore original URL methods
      window.URL.createObjectURL = originalCreateObjectURL;
      window.URL.revokeObjectURL = originalRevokeObjectURL;
      jest.restoreAllMocks();
    });

    it('should create and trigger download with correct filename', async () => {
      await downloadExcelFile(mockFormData, 'test-file');

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.download).toBe('test-file.xlsx');
      expect(mockLink.click).toHaveBeenCalledTimes(1);
    });

    it('should use default filename if not provided', async () => {
      await downloadExcelFile(mockFormData);

      expect(mockLink.download).toBe('ethogram-data.xlsx');
    });

    it('should create blob with correct MIME type', async () => {
      await downloadExcelFile(mockFormData);

      expect(mockCreateObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
      );
    });

    it('should append and remove link from DOM', async () => {
      await downloadExcelFile(mockFormData);

      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);
    });

    it('should revoke object URL after download', async () => {
      await downloadExcelFile(mockFormData);

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should revoke object URL even if download fails', async () => {
      // Mock click to throw error
      mockLink.click.mockImplementation(() => {
        throw new Error('Download failed');
      });

      await expect(downloadExcelFile(mockFormData)).rejects.toThrow(
        'Download failed'
      );

      // URL should still be revoked
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });
});
