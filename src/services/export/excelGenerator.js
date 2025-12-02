/**
 * Excel Generation Service
 *
 * Converts form data to Excel format matching the original ethogram spreadsheet layout.
 * Uses a matrix format where behaviors are rows and time slots are columns.
 */

import ExcelJS from 'exceljs';
import { generateTimeSlots } from '../../utils/timeUtils';

/**
 * Maps behavior values from the form to display labels for Excel rows
 */
const BEHAVIOR_ROW_MAPPING = {
  eating_food_platform: 'Eating - On Food Platform',
  eating_elsewhere: 'Eating - Elsewhere (Note Location)',
  walking_ground: 'Locomotion - Walking on Ground',
  walking_perch: 'Locomotion - Walking on Perch (Note Location)',
  flying: 'Locomotion - Flying',
  jumping: 'Locomotion - Jumping',
  repetitive_locomotion:
    'Repetitive Locomotion (Same movement 3+ times in a row)',
  drinking: 'Drinking (Note source if not from the water bowl)',
  bathing: 'Bathing',
  preening: 'Preening/Grooming (Note Location)',
  repetitive_preening:
    'Repetitive Preening/Feather Damage (Plucking, Mutilation, Etc.)',
  nesting: 'Nesting',
  vocalizing: 'Vocalizing',
  resting_alert: 'Resting on Perch/Ground - Alert (Note Location)',
  resting_not_alert: 'Resting on Perch/Ground - Not Alert (Note Location)',
  resting_unknown: 'Resting on Perch/Ground - Status Unknown (Note Location)',
  interacting_object: 'Interacting with Inanimate Object (Note Object)',
  interacting_animal:
    'Interacting with Other Animal (Note Animal & Type of Interaction)',
  aggression: 'Aggression or Defensive Posturing',
  not_visible: 'Not Visible',
  other: 'Other',
};

/**
 * Converts absolute time (HH:MM) to relative format based on start time
 * @param {string} time - Time in HH:MM format
 * @param {string} startTime - Start time in HH:MM format
 * @returns {string} Relative time in H:MM format (e.g., "0:00", "0:05", "1:30")
 * @note Handles times crossing midnight (e.g., start: 23:55, time: 00:00 → "0:05")
 */
const convertToRelativeTime = (time, startTime) => {
  const [timeHours, timeMinutes] = time.split(':').map(Number);
  const [startHours, startMinutes] = startTime.split(':').map(Number);

  let totalTimeMinutes = timeHours * 60 + timeMinutes;
  const totalStartMinutes = startHours * 60 + startMinutes;

  // Handle midnight crossing: if time is less than start time, add 24 hours
  if (totalTimeMinutes < totalStartMinutes) {
    totalTimeMinutes += 24 * 60; // Add 1440 minutes (24 hours)
  }

  const diffMinutes = totalTimeMinutes - totalStartMinutes;

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  // Always format as H:MM (e.g., "0:00", "0:05", "1:30")
  return `${hours}:${String(minutes).padStart(2, '0')}`;
};

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

  if (observation.interactionType) {
    const interactionValue =
      observation.interactionType === 'other'
        ? observation.interactionTypeOther
        : observation.interactionType;
    parts.push(`Interaction: ${interactionValue}`);
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
 * @returns {Promise<ExcelJS.Workbook>} Excel workbook instance
 */
export const generateExcelWorkbook = async (formData) => {
  const { metadata, observations } = formData;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Ethogram Data');

  // Generate time slots using existing utility function
  const timeSlots = generateTimeSlots(metadata.startTime, metadata.endTime);

  // Set column widths for readability (match server's formatting)
  worksheet.getColumn('A').width = 35.0;
  worksheet.getColumn('B').width = 8.0;
  for (let col = 3; col <= timeSlots.length + 1; col++) {
    worksheet.getColumn(col).width = 13.0;
  }
  worksheet.getColumn('J').width = 15.0;

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

  // Row 3: "Time:" label
  const timeLabelCell = worksheet.getCell('B3');
  timeLabelCell.value = 'Time:';
  timeLabelCell.font = { bold: true };

  // Row 4: Time slot headers (relative format)
  timeSlots.forEach((time, index) => {
    const relativeTime = convertToRelativeTime(time, metadata.startTime);
    const columnIndex = index + 2; // Column B is index 2
    const headerCell = worksheet.getCell(4, columnIndex);
    headerCell.value = relativeTime;
    headerCell.font = { bold: true };
  });

  // Rows 5+: Behavior labels and observation marks
  const behaviorRows = Object.keys(BEHAVIOR_ROW_MAPPING);
  behaviorRows.forEach((behaviorValue, index) => {
    const rowIndex = 5 + index;
    const behaviorLabel = BEHAVIOR_ROW_MAPPING[behaviorValue];

    // Column A: Behavior label with wrapText for long labels
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
  });

  // Add comments section after all behaviors
  const commentsRowIndex = 5 + behaviorRows.length + 2;
  worksheet.getCell(commentsRowIndex, 1).value =
    'Comments (Abnormal Environmental Factors, Plant Growth, Etc):';

  // Freeze panes at B5 (freeze top 4 rows and column A), matching server format
  worksheet.views = [
    { state: 'frozen', xSplit: 1, ySplit: 4, topLeftCell: 'B5' },
  ];

  return workbook;
};

/**
 * Generates and downloads an Excel file
 * @param {Object} formData - Form submission data
 * @param {string} filename - Desired filename (without extension)
 * @returns {Promise<void>}
 */
export const downloadExcelFile = async (
  formData,
  filename = 'ethogram-data'
) => {
  const workbook = await generateExcelWorkbook(formData);

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
