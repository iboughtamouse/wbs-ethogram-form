/**
 * Excel Generation Service
 *
 * Converts form data to Excel format matching the original ethogram spreadsheet layout.
 * Uses a matrix format where behaviors are rows and time slots are columns.
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

/**
 * Generates an Excel workbook from form data
 * @param {Object} formData - Form submission data
 * @param {Object} formData.metadata - Form metadata
 * @param {Object} formData.observations - Observations keyed by time
 * @param {Array<{value: string, label: string}>} behaviorRows - Config-derived
 *   behavior rows (useConfig().excelBehaviorRows), in Excel row order
 * @returns {Promise<ExcelJS.Workbook>} Excel workbook instance
 */
export const generateExcelWorkbook = async (formData, behaviorRows) => {
  const { metadata, observations } = formData;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Ethogram Data');

  // Generate time slots using existing utility function
  const timeSlots = generateTimeSlots(metadata.startTime, metadata.endTime);

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

  // Row 2: Aviary, Patient, Observer
  const aviaryCell = worksheet.getCell('A2');
  aviaryCell.value = `Aviary: ${metadata.aviary}`;
  aviaryCell.font = { bold: true };

  const patientCell = worksheet.getCell('B2');
  patientCell.value = `Patient(s): ${metadata.patient}`;
  patientCell.font = { bold: true };

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
        const observation = observations[time];
        if (observation && observation.behavior === behaviorValue) {
          const columnIndex = timeIndex + 2; // Column B is index 2
          const cellContent = formatCellContent(observation);
          const cell = worksheet.getCell(rowIndex, columnIndex);
          cell.value = cellContent;
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

  return workbook;
};

/**
 * Generates and downloads an Excel file
 * @param {Object} formData - Form submission data
 * @param {Array<{value: string, label: string}>} behaviorRows - Config-derived rows
 * @param {string} filename - Desired filename (without extension)
 * @returns {Promise<void>}
 */
export const downloadExcelFile = async (
  formData,
  behaviorRows,
  filename = 'ethogram-data'
) => {
  const workbook = await generateExcelWorkbook(formData, behaviorRows);

  // Generate Excel file as buffer
  const buffer = await workbook.xlsx.writeBuffer();

  // Create blob and download
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  let url = null;
  try {
    url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    // Ensure URL is revoked even if download fails
    if (url) {
      window.URL.revokeObjectURL(url);
    }
  }
};
