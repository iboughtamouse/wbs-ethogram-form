/**
 * Excel Generation Service
 *
 * Converts form data to Excel format matching the original ethogram spreadsheet layout.
 * Uses a matrix format where behaviors are rows and time slots are columns.
 * Multi-subject sessions render as one worksheet per subject (P2-D3), each
 * the same matrix — mirroring the backend generator's rules exactly.
 */

import ExcelJS from 'exceljs';
import { generateTimeSlots } from '../../utils/timeUtils';

/**
 * Formats observation details for a cell
 * @param {Object} observation - Observation data
 * @returns {string} Formatted cell content with newline-separated details
 * @note Cells using this format require wrapText: true alignment for proper display
 */
const formatCellContent = (observation) => {
  const parts = ['x'];

  if (observation.location) {
    parts.push(`Loc: ${observation.location}`);
  }

  if (observation.object) {
    const objectValue =
      observation.object === 'other'
        ? observation.objectOther
        : observation.object;
    parts.push(`Object: ${objectValue}`);
  }

  if (observation.animal) {
    const animalValue =
      observation.animal === 'other'
        ? observation.animalOther
        : observation.animal;
    parts.push(`Animal: ${animalValue}`);
  }

  // Handle object interaction type (new field)
  if (observation.objectInteractionType) {
    const interactionValue =
      observation.objectInteractionType === 'other'
        ? observation.objectInteractionTypeOther
        : observation.objectInteractionType;
    parts.push(`Object Interaction: ${interactionValue}`);
  }

  // Animal interaction type
  const animalInteractionType = observation.animalInteractionType;
  if (animalInteractionType) {
    const interactionValue =
      animalInteractionType === 'other'
        ? observation.animalInteractionTypeOther
        : animalInteractionType;
    parts.push(`Animal Interaction: ${interactionValue}`);
  }

  if (observation.description) {
    parts.push(`Description: ${observation.description}`);
  }

  if (observation.notes) {
    parts.push(`Notes: ${observation.notes}`);
  }

  return parts.length > 1 ? parts.join('\n') : 'x';
};

/** Strip leading/trailing apostrophes and whitespace (Excel rejects both). */
const stripSheetNameBoundary = (name) => name.replace(/^['\s]+|['\s]+$/g, '');

/**
 * Excel worksheet names must satisfy Excel's rules: no `* ? : \ / [ ]`, no
 * leading/trailing apostrophe, 1–31 chars, not the reserved name "History",
 * unique per workbook (case-insensitive). Truncated to 28 chars to leave
 * room for a dedupe suffix; the untruncated subject name lives in the
 * sheet's Subject(s) header row. Boundary stripping runs AFTER truncation —
 * the slice can re-expose a boundary apostrophe.
 */
const sanitizeSheetName = (name) => {
  const cleaned = name
    .replace(/[*?:\\/[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const base = stripSheetNameBoundary(cleaned.slice(0, 28));
  if (base === '') return 'Subject';
  // ExcelJS throws on the exact (case-sensitive) reserved name
  if (base === 'History') return 'History (Subject)';
  return base;
};

const uniqueSheetName = (subjectName, used) => {
  const base = sanitizeSheetName(subjectName);
  let candidate = base;
  for (let suffix = 2; used.has(candidate.toLowerCase()); suffix++) {
    const tag = ` ${suffix}`;
    candidate = `${stripSheetNameBoundary(base.slice(0, 31 - tag.length))}${tag}`;
  }
  used.add(candidate.toLowerCase());
  return candidate;
};

/**
 * Unique subjectIds across the session's time slots, in chronological slot
 * order (keys are fixed-width HH:MM, so a lexicographic sort is
 * chronological — the same rule as the backend generator).
 */
const subjectIdsInSlotOrder = (observations) => [
  ...new Set(
    Object.keys(observations)
      .sort()
      .flatMap((time) =>
        (observations[time] ?? []).map((o) => o.subjectId ?? 'Unknown')
      )
  ),
];

/**
 * Behavior rows for the workbook: the config catalog (already in Excel row
 * order) filtered to rows enabled for the aviary PLUS rows whose value is
 * actually present in the data — the Phase 2 §4 alignment rule, identical
 * to the backend's behaviorRowsFor(). A draft-held retired value keeps its
 * row without rendering every retired row empty.
 *
 * @param {Array<{value, label, enabled}>} behaviorCatalog - useConfig().excelBehaviorRows
 * @param {Object} observations - Observations keyed by time (arrays of cards)
 */
export const behaviorRowsFor = (behaviorCatalog, observations) => {
  const present = new Set(
    Object.values(observations)
      .flat()
      .map((o) => o.behavior)
  );

  return behaviorCatalog
    .filter((b) => b.enabled || present.has(b.value))
    .map(({ value, label }) => ({ value, label }));
};

/**
 * Adds one subject's worksheet: the ethogram matrix layout (headers,
 * behavior rows × time-slot columns, comments row, frozen panes).
 */
const addSubjectWorksheet = (workbook, params) => {
  const {
    sheetName,
    subject,
    metadata,
    observations,
    timeSlots,
    behaviorRows,
  } = params;
  const worksheet = workbook.addWorksheet(sheetName);

  // Set column widths for readability
  worksheet.getColumn('A').width = 35.0; // Behavior labels column - increased ~35% from 25.75 to reduce wrapping
  worksheet.getColumn('B').width = 8.0; // Time column headers - increased from 4.88 for readability
  // Columns C onwards (time slots) - set width 13.0
  for (let col = 3; col <= timeSlots.length + 2; col++) {
    worksheet.getColumn(col).width = 13.0;
  }
  worksheet.getColumn('J').width = 15.0; // "Time Window:" and "Observer:" labels - wide enough for labels

  // Row 1: Title, Date, Time Window
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'Rehabilitation Raptor Ethogram';
  titleCell.font = { bold: true };

  const dateLabel = worksheet.getCell('B1');
  dateLabel.value = 'Date:';
  dateLabel.font = { bold: true };

  worksheet.getCell('C1').value = metadata.date;

  const timeWindowLabel = worksheet.getCell('J1');
  timeWindowLabel.value = 'Time Window:';
  timeWindowLabel.font = { bold: true };

  worksheet.getCell('K1').value = `${metadata.startTime} - ${metadata.endTime}`;

  // Row 2: Aviary, Subject, Observer. The subject cell carries the full
  // untruncated name (the sheet name may be sanitized/truncated).
  const aviaryCell = worksheet.getCell('A2');
  aviaryCell.value = `Aviary: ${metadata.aviary}`;
  aviaryCell.font = { bold: true };

  const subjectCell = worksheet.getCell('B2');
  subjectCell.value = `Subject(s): ${subject}`;
  subjectCell.font = { bold: true };

  const observerLabel = worksheet.getCell('J2');
  observerLabel.value = 'Observer:';
  observerLabel.font = { bold: true };

  worksheet.getCell('K2').value = metadata.observerName;

  // Row 3: "Time:" label (bold)
  const timeLabelCell = worksheet.getCell('B3');
  timeLabelCell.value = 'Time:';
  timeLabelCell.font = { bold: true };

  // Row 4: Time slot headers (actual timestamps) - make bold
  timeSlots.forEach((time, index) => {
    const columnIndex = index + 2; // Column B is index 2
    const headerCell = worksheet.getCell(4, columnIndex);
    headerCell.value = time;
    headerCell.font = { bold: true };
  });

  // Rows 5+: Behavior labels and observation marks
  behaviorRows.forEach(
    ({ value: behaviorValue, label: behaviorLabel }, index) => {
      const rowIndex = 5 + index;

      // Column A: Behavior label with text wrapping
      const labelCell = worksheet.getCell(rowIndex, 1);
      labelCell.value = behaviorLabel;
      labelCell.alignment = { wrapText: true, vertical: 'top' };

      // Check each time slot for this behavior
      timeSlots.forEach((time, timeIndex) => {
        const slotObservations = observations[time];
        if (!slotObservations) return;

        // Cards here are already this subject's only; the protocol records
        // one behavior per subject per slot, so more than one match is
        // anomalous data — render all rather than silently dropping any
        const matchingObs = slotObservations.filter(
          (obs) => obs.behavior === behaviorValue
        );

        if (matchingObs.length > 0) {
          const columnIndex = timeIndex + 2; // Column B is index 2
          const cell = worksheet.getCell(rowIndex, columnIndex);
          cell.value = matchingObs.map(formatCellContent).join('\n—\n');
          // Enable text wrapping for cells with newline-separated content
          cell.alignment = { wrapText: true, vertical: 'top' };
        }
      });
    }
  );

  // Add comments section after all behaviors
  const commentsRowIndex = 5 + behaviorRows.length + 2;
  const commentsCell = worksheet.getCell(commentsRowIndex, 1);
  commentsCell.value =
    'Comments (Abnormal Environmental Factors, Plant Growth, Etc):';
  commentsCell.alignment = { wrapText: true, vertical: 'top' };

  // Freeze panes at B5 (freeze top 4 rows and column A)
  worksheet.views = [
    { state: 'frozen', xSplit: 1, ySplit: 4, topLeftCell: 'B5' },
  ];
};

/**
 * Generates an Excel workbook from form data: one worksheet per subject,
 * each the same behavior×time matrix, subjects in slot order.
 * @param {Object} formData - Form submission data
 * @param {Object} formData.metadata - Form metadata (aviary already resolved
 *   to its display name by the caller — state carries the slug)
 * @param {Object} formData.observations - Observations keyed by time, each an
 *   array of per-subject cards
 * @param {Array<{value, label, enabled}>} behaviorCatalog - Config-derived
 *   behavior catalog (useConfig().excelBehaviorRows), in Excel row order
 * @returns {Promise<ExcelJS.Workbook>} Excel workbook instance
 */
export const generateExcelWorkbook = async (formData, behaviorCatalog) => {
  const { metadata, observations } = formData;
  const workbook = new ExcelJS.Workbook();

  // Generate time slots using existing utility function
  const timeSlots = generateTimeSlots(metadata.startTime, metadata.endTime);
  // One row set shared by every sheet — identical matrix per bird
  const behaviorRows = behaviorRowsFor(behaviorCatalog, observations);

  const subjects = subjectIdsInSlotOrder(observations);
  if (subjects.length === 0) {
    subjects.push('Unknown');
  }

  const usedSheetNames = new Set();
  subjects.forEach((subject) => {
    const subjectObservations = {};
    Object.entries(observations).forEach(([time, slot]) => {
      const matching = slot.filter(
        (obs) => (obs.subjectId ?? 'Unknown') === subject
      );
      if (matching.length > 0) {
        subjectObservations[time] = matching;
      }
    });

    addSubjectWorksheet(workbook, {
      sheetName: uniqueSheetName(subject, usedSheetNames),
      subject,
      metadata,
      observations: subjectObservations,
      timeSlots,
      behaviorRows,
    });
  });

  return workbook;
};
