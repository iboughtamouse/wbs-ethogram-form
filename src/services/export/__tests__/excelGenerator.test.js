import { generateExcelWorkbook } from '../excelGenerator';
import ExcelJS from 'exceljs';

describe('excelGenerator', () => {
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
          behavior: 'interaction-inanimate',
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
  });
});
