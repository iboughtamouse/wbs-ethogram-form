/**
 * Download Service
 *
 * Handles downloading observation Excel files from backend or generating locally
 */

import { generateExcelBuffer } from './export/excelGenerator';

/**
 * Download Excel file from backend
 *
 * @param {string} observationId - Observation ID from successful submission
 * @returns {Promise<void>}
 * @throws {Error} If download fails
 */
export async function downloadFromBackend(observationId) {
  try {
    const response = await fetch(`/api/observations/${observationId}/excel`);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    // Get the blob and trigger download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ethogram-observation-${observationId}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Backend download failed:', error);
    throw error;
  }
}

/**
 * Generate and download Excel file locally (fallback when backend unavailable)
 *
 * @param {Object} formData - Complete form data with metadata and observations
 * @param {boolean} isOffline - Whether this is an offline/fallback generation
 * @returns {Promise<void>}
 */
export async function downloadLocally(formData, isOffline = false) {
  try {
    // Add offline notice to metadata if applicable
    const dataToExport = isOffline
      ? {
          ...formData,
          metadata: {
            ...formData.metadata,
            _offlineNotice: 'Generated offline - not submitted to WBS',
          },
        }
      : formData;

    // Generate Excel buffer
    const buffer = await generateExcelBuffer(dataToExport);

    // Create blob and trigger download
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const prefix = isOffline ? 'offline' : 'ethogram';
    a.download = `${prefix}-observation-${timestamp}.xlsx`;

    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Local Excel generation failed:', error);
    throw error;
  }
}
