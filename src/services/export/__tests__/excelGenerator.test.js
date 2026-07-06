import { generateExcelWorkbook, behaviorRowsFor } from '../excelGenerator';
import { adaptConfig } from '../../configAdapter';
import { bundledConfig } from '../../configService';

// Config-derived catalog, same source production uses (useConfig().excelBehaviorRows)
const EXCEL_ROWS = adaptConfig(bundledConfig).excelBehaviorRows;
import ExcelJS from 'exceljs';

// Fixture helper: one per-subject observation card in the array-native shape
const cardFor = (subjectId, overrides = {}) => ({
  subjectType: 'foster_parent',
  subjectId,
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
        mode: 'live',
      },
      observations: {
        '09:00': [
          cardFor('Sayyida', {
            behavior: 'eating',
            location: 'F1',
          }),
        ],
        '09:05': [
          cardFor('Sayyida', {
            behavior: 'preening',
            location: '3',
            notes: 'Very focused',
          }),
        ],
        '09:10': [
          cardFor('Sayyida', {
            behavior: 'interacting_object',
            object: 'toy',
            objectInteractionType: 'playing',
            description: 'Playing with toy',
          }),
        ],
      },
      submittedAt: '2025-01-15T09:20:00.000Z',
    };

    it('should return an ExcelJS workbook instance', async () => {
      const workbook = await generateExcelWorkbook(mockFormData, EXCEL_ROWS);

      expect(workbook).toBeInstanceOf(ExcelJS.Workbook);
    });

    it('should create a worksheet named after the subject', async () => {
      const workbook = await generateExcelWorkbook(mockFormData, EXCEL_ROWS);
      const worksheet = workbook.getWorksheet('Sayyida');

      expect(worksheet).toBeDefined();
      expect(worksheet.name).toBe('Sayyida');
    });

    it('should include metadata in header rows', async () => {
      const workbook = await generateExcelWorkbook(mockFormData, EXCEL_ROWS);
      const worksheet = workbook.getWorksheet('Sayyida');

      // Row 1: Title, Date, Time Window
      expect(worksheet.getCell('A1').value).toBe(
        'Rehabilitation Raptor Ethogram'
      );
      expect(worksheet.getCell('B1').value).toBe('Date:');
      expect(worksheet.getCell('C1').value).toBe('2025-01-15');
      expect(worksheet.getCell('J1').value).toBe('Time Window:');
      expect(worksheet.getCell('K1').value).toBe('09:00 - 09:15');

      // Row 2: Aviary, Subject, Observer
      expect(worksheet.getCell('A2').value).toContain("Aviary: Sayyida's Cove");
      expect(worksheet.getCell('B2').value).toContain('Subject(s): Sayyida');
      expect(worksheet.getCell('J2').value).toBe('Observer:');
      expect(worksheet.getCell('K2').value).toBe('John Doe');

      // Row 3: "Time:" label
      expect(worksheet.getCell('B3').value).toBe('Time:');
    });

    it('should include time slot headers in row 4', async () => {
      const workbook = await generateExcelWorkbook(mockFormData, EXCEL_ROWS);
      const worksheet = workbook.getWorksheet('Sayyida');

      // Time slots start at column B (column 2) with actual timestamps
      expect(worksheet.getCell('B4').value).toBe('09:00');
      expect(worksheet.getCell('C4').value).toBe('09:05');
      expect(worksheet.getCell('D4').value).toBe('09:10');
    });

    it('should place behavior labels in column A starting at row 5', async () => {
      const workbook = await generateExcelWorkbook(mockFormData, EXCEL_ROWS);
      const worksheet = workbook.getWorksheet('Sayyida');

      // Check first few behavior labels (new consolidated behaviors + legacy for backward compatibility)
      expect(worksheet.getCell('A5').value).toBe('Eating (Note Location)');
      expect(worksheet.getCell('A6').value).toBe(
        'Locomotion - Walking (Note Location)'
      );
      // Row 7 is legacy eating_food_platform for backward compatibility
      expect(worksheet.getCell('A7').value).toBe('Eating - On Food Platform');
    });

    it('should mark observed behaviors with "x"', async () => {
      const workbook = await generateExcelWorkbook(mockFormData, EXCEL_ROWS);
      const worksheet = workbook.getWorksheet('Sayyida');

      // 09:00 (column B), eating (row 5)
      const cell1 = worksheet.getCell('B5');
      expect(cell1.value).toContain('x'); // May contain location info

      // 09:05 (column C), preening (row should be calculated)
      // Need to find the preening row - it's around row 14 based on the screenshot
    });

    it('should include location and notes in cell when present', async () => {
      const workbook = await generateExcelWorkbook(mockFormData, EXCEL_ROWS);
      const worksheet = workbook.getWorksheet('Sayyida');

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
      const workbook = await generateExcelWorkbook(mockFormData, EXCEL_ROWS);
      const worksheet = workbook.getWorksheet('Sayyida');

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
          mode: 'live',
        },
        observations: {},
        submittedAt: '2025-01-16T10:15:00.000Z',
      };

      const workbook = await generateExcelWorkbook(emptyData, EXCEL_ROWS);
      // No cards means no subjects -> a single fallback sheet
      const worksheet = workbook.getWorksheet('Unknown');

      // Should still have metadata and structure
      expect(worksheet).toBeDefined();
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

      const workbook = await generateExcelWorkbook(vodData, EXCEL_ROWS);
      const worksheet = workbook.getWorksheet('Sayyida');

      // VOD mode should show original times (not converted)
      expect(worksheet.getCell('K1').value).toBe('14:30 - 14:45');
    });

    it('should add comments section at bottom', async () => {
      const workbook = await generateExcelWorkbook(mockFormData, EXCEL_ROWS);
      const worksheet = workbook.getWorksheet('Sayyida');

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

    it('should use actual timestamps in time slot headers (not relative format)', async () => {
      const workbook = await generateExcelWorkbook(mockFormData, EXCEL_ROWS);
      const worksheet = workbook.getWorksheet('Sayyida');

      // Time slots should use actual timestamps (HH:MM format)
      expect(worksheet.getCell('B4').value).toBe('09:00');
      // 09:05 remains as 09:05
      expect(worksheet.getCell('C4').value).toBe('09:05');
      // 09:10 remains as 09:10
      expect(worksheet.getCell('D4').value).toBe('09:10');
    });

    it('should handle hour-long observations correctly', async () => {
      const longData = {
        metadata: {
          observerName: 'Observer',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '10:00',
          aviary: "Sayyida's Cove",
          mode: 'live',
        },
        observations: {
          '09:00': [cardFor('Sayyida', { behavior: 'flying' })],
          '09:55': [
            cardFor('Sayyida', { behavior: 'resting_alert', location: '5' }),
          ],
        },
        submittedAt: '2025-01-15T10:05:00.000Z',
      };

      const workbook = await generateExcelWorkbook(longData, EXCEL_ROWS);
      const worksheet = workbook.getWorksheet('Sayyida');

      // Should have columns for all 5-minute intervals with actual timestamps
      expect(worksheet.getCell('B4').value).toBe('09:00');
      expect(worksheet.getCell('M4').value).toBe('09:55'); // 12th column (B + 11)
    });

    it('should handle midnight crossing observations (23:55 to 00:00)', async () => {
      const midnightData = {
        metadata: {
          observerName: 'Night Observer',
          date: '2025-01-15',
          startTime: '23:55',
          endTime: '00:00',
          aviary: "Sayyida's Cove",
          mode: 'live',
        },
        observations: {
          '23:55': [
            cardFor('Sayyida', {
              behavior: 'resting_alert',
              location: '1',
              notes: 'Before midnight',
            }),
          ],
          '00:00': [
            cardFor('Sayyida', {
              behavior: 'vocalizing',
              notes: 'After midnight',
            }),
          ],
        },
        submittedAt: '2025-01-16T00:05:00.000Z',
      };

      const workbook = await generateExcelWorkbook(midnightData, EXCEL_ROWS);
      const worksheet = workbook.getWorksheet('Sayyida');

      // Time window should show actual times
      expect(worksheet.getCell('K1').value).toBe('23:55 - 00:00');

      // Time headers should show actual timestamps: 23:55 and 00:00
      expect(worksheet.getCell('B4').value).toBe('23:55');
      expect(worksheet.getCell('C4').value).toBe('00:00');

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
        const cell = worksheet.getCell(restingRow, 2); // Column B = 23:55
        expect(cell.value).toBeTruthy();
        expect(cell.value).toContain('Loc: 1');
      }

      if (vocalizingRow) {
        const cell = worksheet.getCell(vocalizingRow, 3); // Column C = 00:00
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
          mode: 'live',
        },
        observations: {},
        submittedAt: '2025-01-16T00:35:00.000Z',
      };

      const workbook = await generateExcelWorkbook(fullHourData, EXCEL_ROWS);
      const worksheet = workbook.getWorksheet('Unknown');

      // Should have 13 time slots with actual timestamps (23:30, 23:35, ..., 00:30)
      expect(worksheet.getCell('B4').value).toBe('23:30'); // Start at 23:30
      expect(worksheet.getCell('G4').value).toBe('23:55'); // 6th column
      expect(worksheet.getCell('H4').value).toBe('00:00'); // 7th column (crosses midnight)
      expect(worksheet.getCell('M4').value).toBe('00:25'); // 12th column
      expect(worksheet.getCell('N4').value).toBe('00:30'); // 13th column (end)
    });

    it('should handle "other" animal value correctly', async () => {
      const dataWithOtherAnimal = {
        metadata: {
          observerName: 'Observer',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '09:10',
          aviary: "Sayyida's Cove",
          mode: 'live',
        },
        observations: {
          '09:00': [
            cardFor('Sayyida', {
              behavior: 'interacting_animal',
              animal: 'other',
              animalOther: 'squirrel',
              animalInteractionType: 'watching',
            }),
          ],
        },
        submittedAt: '2025-01-15T09:15:00.000Z',
      };

      const workbook = await generateExcelWorkbook(
        dataWithOtherAnimal,
        EXCEL_ROWS
      );
      const worksheet = workbook.getWorksheet('Sayyida');

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
          mode: 'live',
        },
        observations: {
          '09:00': [
            cardFor('Sayyida', {
              behavior: 'interacting_animal',
              animal: 'insect',
              animalInteractionType: 'other',
              animalInteractionTypeOther: 'chasing',
            }),
          ],
        },
        submittedAt: '2025-01-15T09:15:00.000Z',
      };

      const workbook = await generateExcelWorkbook(
        dataWithOtherInteraction,
        EXCEL_ROWS
      );
      const worksheet = workbook.getWorksheet('Sayyida');

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

    it('should fall back to the literal "other" when objectOther is empty', async () => {
      const dataWithEmptyObjectOther = {
        metadata: {
          observerName: 'Observer',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '09:10',
          aviary: "Sayyida's Cove",
          mode: 'live',
        },
        observations: {
          '09:00': [
            cardFor('Sayyida', {
              behavior: 'interacting_object',
              object: 'other',
              objectOther: '',
              objectInteractionType: 'playing',
            }),
          ],
        },
        submittedAt: '2025-01-15T09:15:00.000Z',
      };

      const workbook = await generateExcelWorkbook(
        dataWithEmptyObjectOther,
        EXCEL_ROWS
      );
      const worksheet = workbook.getWorksheet('Sayyida');

      const objectRow = findBehaviorRow(
        worksheet,
        'Interacting with Inanimate'
      );

      expect(objectRow).not.toBeNull();
      if (objectRow) {
        const cell = worksheet.getCell(objectRow, 2); // Column B = 09:00
        // Backend parity: empty objectOther renders the literal 'other',
        // never 'undefined' or a blank line
        expect(cell.value).toContain('Object: other');
        expect(cell.value).not.toContain('Object: undefined');
        expect(cell.value).not.toMatch(/Object:\s*(\n|$)/);
      }
    });

    // Multi-subject tests
    it('should produce one worksheet per subject in slot order, each with its own data', async () => {
      const twoSubjectData = {
        metadata: {
          observerName: 'Observer',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '09:10',
          aviary: "Sayyida's Cove",
          mode: 'live',
        },
        observations: {
          '09:00': [cardFor('Sayyida', { behavior: 'eating' })],
          '09:05': [
            cardFor('Sayyida', { behavior: 'preening' }),
            cardFor('Pip', { behavior: 'flying' }),
          ],
        },
        submittedAt: '2025-01-15T09:15:00.000Z',
      };

      const workbook = await generateExcelWorkbook(twoSubjectData, EXCEL_ROWS);

      // Sheets in slot order (Sayyida appears first), not alphabetical
      expect(workbook.worksheets.map((ws) => ws.name)).toEqual([
        'Sayyida',
        'Pip',
      ]);

      const sayyidaSheet = workbook.getWorksheet('Sayyida');
      const pipSheet = workbook.getWorksheet('Pip');

      // Each sheet carries its own subject header
      expect(sayyidaSheet.getCell('B2').value).toBe('Subject(s): Sayyida');
      expect(pipSheet.getCell('B2').value).toBe('Subject(s): Pip');

      const eatingRow = findBehaviorRow(sayyidaSheet, 'Eating (Note Location)');
      const preeningRow = findBehaviorRow(sayyidaSheet, 'Preening/Grooming');
      const flyingRow = findBehaviorRow(sayyidaSheet, 'Locomotion - Flying');

      // Sayyida's sheet: her observations only
      expect(sayyidaSheet.getCell(eatingRow, 2).value).toContain('x'); // 09:00
      expect(sayyidaSheet.getCell(preeningRow, 3).value).toContain('x'); // 09:05
      expect(sayyidaSheet.getCell(flyingRow, 3).value).toBeFalsy(); // Pip's data

      // Pip's sheet: his observations only (same shared row layout)
      expect(pipSheet.getCell(flyingRow, 3).value).toContain('x'); // 09:05
      expect(pipSheet.getCell(eatingRow, 2).value).toBeFalsy(); // Sayyida's data
      expect(pipSheet.getCell(preeningRow, 3).value).toBeFalsy();
    });

    // Sheet name sanitization / deduplication
    describe('worksheet naming', () => {
      const formDataForSubjects = (subjectIds) => ({
        metadata: {
          observerName: 'Observer',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '09:05',
          aviary: "Sayyida's Cove",
          mode: 'live',
        },
        observations: {
          '09:00': subjectIds.map((subjectId) =>
            cardFor(subjectId, { behavior: 'eating' })
          ),
        },
        submittedAt: '2025-01-15T09:10:00.000Z',
      });

      it('should replace forbidden characters with spaces in sheet names', async () => {
        const workbook = await generateExcelWorkbook(
          formDataForSubjects(['Bird*One?Two:Three']),
          EXCEL_ROWS
        );

        const worksheet = workbook.worksheets[0];
        expect(worksheet.name).toBe('Bird One Two Three');
        // B2 header keeps the full untouched subject name
        expect(worksheet.getCell('B2').value).toBe(
          'Subject(s): Bird*One?Two:Three'
        );
      });

      it('should truncate sheet names longer than 28 characters', async () => {
        const longName = 'Supercalifragilisticexpialidocious'; // 34 chars
        const workbook = await generateExcelWorkbook(
          formDataForSubjects([longName]),
          EXCEL_ROWS
        );

        const worksheet = workbook.worksheets[0];
        expect(worksheet.name).toBe('Supercalifragilisticexpialid'); // 28 chars
        expect(worksheet.getCell('B2').value).toBe(`Subject(s): ${longName}`);
      });

      it('should dedupe colliding sheet names with a numeric suffix', async () => {
        const workbook = await generateExcelWorkbook(
          formDataForSubjects(['Bird/One', 'Bird*One']),
          EXCEL_ROWS
        );

        // Both sanitize to 'Bird One'; second sheet gets ' 2'
        expect(workbook.worksheets.map((ws) => ws.name)).toEqual([
          'Bird One',
          'Bird One 2',
        ]);
      });

      it('should dedupe sheet names case-insensitively', async () => {
        const workbook = await generateExcelWorkbook(
          formDataForSubjects(['Sayyida', 'sayyida']),
          EXCEL_ROWS
        );

        // Excel treats sheet names as case-insensitively unique; the
        // second subject keeps its own casing but gets the ' 2' suffix
        expect(workbook.worksheets.map((ws) => ws.name)).toEqual([
          'Sayyida',
          'sayyida 2',
        ]);

        // Each sheet still carries its own subject header
        expect(workbook.worksheets[0].getCell('B2').value).toBe(
          'Subject(s): Sayyida'
        );
        expect(workbook.worksheets[1].getCell('B2').value).toBe(
          'Subject(s): sayyida'
        );
      });

      it('should strip an apostrophe re-exposed at the truncation boundary', async () => {
        // 34 chars; the 28th char (slice boundary) is the apostrophe in
        // "Sayyida's", so the raw truncation would end with an apostrophe
        const longName = "Juvenile Barred Owl Sayyida's Baby";
        const workbook = await generateExcelWorkbook(
          formDataForSubjects([longName]),
          EXCEL_ROWS
        );

        const worksheet = workbook.worksheets[0];
        expect(worksheet.name).toBe('Juvenile Barred Owl Sayyida');
        // Excel rejects sheet names with a boundary apostrophe
        expect(worksheet.name.startsWith("'")).toBe(false);
        expect(worksheet.name.endsWith("'")).toBe(false);
        // B2 header keeps the full untouched subject name
        expect(worksheet.getCell('B2').value).toBe(`Subject(s): ${longName}`);
      });

      it('should rename the reserved sheet name "History"', async () => {
        const workbook = await generateExcelWorkbook(
          formDataForSubjects(['History']),
          EXCEL_ROWS
        );

        const worksheet = workbook.worksheets[0];
        expect(worksheet.name).toBe('History (Subject)');
        expect(worksheet.getCell('B2').value).toBe('Subject(s): History');
      });
    });

    // Formatting tests
    it('should apply column width settings', async () => {
      const workbook = await generateExcelWorkbook(mockFormData, EXCEL_ROWS);
      const worksheet = workbook.getWorksheet('Sayyida');

      // Column A: Behavior labels (35.0)
      expect(worksheet.getColumn('A').width).toBe(35.0);
      // Column B: Time label (8.0)
      expect(worksheet.getColumn('B').width).toBe(8.0);
      // Column C: First time slot (13.0)
      expect(worksheet.getColumn('C').width).toBe(13.0);
      // Column J: Metadata labels (15.0)
      expect(worksheet.getColumn('J').width).toBe(15.0);
    });

    it('should apply bold formatting to headers', async () => {
      const workbook = await generateExcelWorkbook(mockFormData, EXCEL_ROWS);
      const worksheet = workbook.getWorksheet('Sayyida');

      // Row 1 headers
      expect(worksheet.getCell('A1').font?.bold).toBe(true); // Title
      expect(worksheet.getCell('B1').font?.bold).toBe(true); // "Date:"
      expect(worksheet.getCell('J1').font?.bold).toBe(true); // "Time Window:"

      // Row 2 headers
      expect(worksheet.getCell('A2').font?.bold).toBe(true); // "Aviary:"
      expect(worksheet.getCell('B2').font?.bold).toBe(true); // "Subject(s):"
      expect(worksheet.getCell('J2').font?.bold).toBe(true); // "Observer:"

      // Row 3 "Time:" label
      expect(worksheet.getCell('B3').font?.bold).toBe(true);

      // Row 4 time slot headers
      expect(worksheet.getCell('B4').font?.bold).toBe(true);
      expect(worksheet.getCell('C4').font?.bold).toBe(true);
    });

    it('should apply text wrapping to behavior labels', async () => {
      const workbook = await generateExcelWorkbook(mockFormData, EXCEL_ROWS);
      const worksheet = workbook.getWorksheet('Sayyida');

      // Behavior labels in column A should have text wrapping
      const behaviorCell = worksheet.getCell('A5'); // First behavior row
      expect(behaviorCell.alignment?.wrapText).toBe(true);
      expect(behaviorCell.alignment?.vertical).toBe('top');
    });

    it('should apply text wrapping to observation cells', async () => {
      const dataWithObservation = {
        metadata: {
          observerName: 'Observer',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '09:10',
          aviary: "Sayyida's Cove",
          mode: 'live',
        },
        observations: {
          '09:00': [
            cardFor('Sayyida', {
              behavior: 'resting_alert',
              location: '5',
              notes: 'Looking around',
            }),
          ],
        },
        submittedAt: '2025-01-15T09:15:00.000Z',
      };

      const workbook = await generateExcelWorkbook(
        dataWithObservation,
        EXCEL_ROWS
      );
      const worksheet = workbook.getWorksheet('Sayyida');

      // Find the resting_alert row
      const rows = worksheet.getRows(5, 25);
      let restingRow = null;

      rows.forEach((row, index) => {
        const cellValue = row.getCell(1).value;
        if (
          cellValue &&
          cellValue.toString().includes('Resting on Perch/Ground - Alert')
        ) {
          restingRow = 5 + index;
        }
      });

      expect(restingRow).not.toBeNull();

      if (restingRow) {
        const cell = worksheet.getCell(restingRow, 2); // Column B = 09:00
        expect(cell.alignment?.wrapText).toBe(true);
        expect(cell.alignment?.vertical).toBe('top');
      }
    });

    it('should apply text wrapping to comments section', async () => {
      const workbook = await generateExcelWorkbook(mockFormData, EXCEL_ROWS);
      const worksheet = workbook.getWorksheet('Sayyida');

      // Find comments section
      const rows = worksheet.getRows(25, 10);
      let commentsRow = null;

      rows.forEach((row, index) => {
        const cellValue = row.getCell(1).value;
        if (cellValue && cellValue.toString().includes('Comments')) {
          commentsRow = 25 + index;
        }
      });

      expect(commentsRow).not.toBeNull();

      if (commentsRow) {
        const cell = worksheet.getCell(commentsRow, 1);
        expect(cell.alignment?.wrapText).toBe(true);
        expect(cell.alignment?.vertical).toBe('top');
      }
    });

    it('should apply frozen panes at B5', async () => {
      const workbook = await generateExcelWorkbook(mockFormData, EXCEL_ROWS);
      const worksheet = workbook.getWorksheet('Sayyida');

      // Should have frozen panes view
      expect(worksheet.views).toBeDefined();
      expect(worksheet.views.length).toBeGreaterThan(0);

      const frozenView = worksheet.views[0];
      expect(frozenView.state).toBe('frozen');
      expect(frozenView.xSplit).toBe(1); // Freeze column A
      expect(frozenView.ySplit).toBe(4); // Freeze top 4 rows
      expect(frozenView.topLeftCell).toBe('B5');
    });
  });

  describe('behaviorRowsFor', () => {
    const catalog = [
      { value: 'eating', label: 'Eating', enabled: true },
      { value: 'retired_present', label: 'Retired (In Data)', enabled: false },
      { value: 'retired_absent', label: 'Retired (Absent)', enabled: false },
    ];

    it('should keep a disabled behavior that is present in the data', () => {
      const observations = {
        '09:00': [cardFor('Sayyida', { behavior: 'retired_present' })],
      };

      const rows = behaviorRowsFor(catalog, observations);

      expect(rows).toEqual([
        { value: 'eating', label: 'Eating' },
        { value: 'retired_present', label: 'Retired (In Data)' },
      ]);
    });

    it('should drop disabled behaviors absent from the data', () => {
      const observations = {
        '09:00': [cardFor('Sayyida', { behavior: 'eating' })],
      };

      const rows = behaviorRowsFor(catalog, observations);

      expect(rows).toEqual([{ value: 'eating', label: 'Eating' }]);
    });
  });
});
