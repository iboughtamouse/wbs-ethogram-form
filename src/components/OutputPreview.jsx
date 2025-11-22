import { useState } from 'react';
import PropTypes from 'prop-types';
import { downloadExcelFile } from '../services/export/excelGenerator';

const OutputPreview = ({ data }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadExcel = async () => {
    try {
      setIsDownloading(true);
      // Sanitize patient name to remove invalid filename characters
      const sanitizedPatient = data.metadata.patient.replace(
        /[/\\:*?"<>|]/g,
        '_'
      );
      const filename = `ethogram-${sanitizedPatient}-${data.metadata.date}`;
      await downloadExcelFile(data, filename);
    } catch (error) {
      console.error('Failed to generate Excel file:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      alert(
        `Failed to generate Excel file: ${errorMessage}\n\n` +
          'Please try the following:\n' +
          '1. Check that your browser allows downloads\n' +
          '2. Ensure you have sufficient disk space\n' +
          '3. Try again in a few moments\n\n' +
          'If the problem persists, please contact support.'
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="output-preview">
      <h3>Data Preview</h3>
      <p style={{ marginBottom: '15px', color: '#7f8c8d' }}>
        Review your data below, then download the Excel file to submit.
      </p>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleDownloadExcel}
          disabled={isDownloading}
          className="btn-primary"
          style={{ marginRight: '10px' }}
        >
          {isDownloading ? 'Generating...' : 'Download Excel File'}
        </button>
      </div>

      <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>JSON Preview</h4>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

OutputPreview.propTypes = {
  data: PropTypes.shape({
    metadata: PropTypes.shape({
      observerName: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      startTime: PropTypes.string.isRequired,
      endTime: PropTypes.string.isRequired,
      aviary: PropTypes.string.isRequired,
      patient: PropTypes.string.isRequired,
      mode: PropTypes.string.isRequired,
    }).isRequired,
    observations: PropTypes.objectOf(
      PropTypes.shape({
        behavior: PropTypes.string.isRequired,
        location: PropTypes.string.isRequired,
        notes: PropTypes.string.isRequired,
        object: PropTypes.string.isRequired,
        objectOther: PropTypes.string.isRequired,
        animal: PropTypes.string.isRequired,
        animalOther: PropTypes.string.isRequired,
        interactionType: PropTypes.string.isRequired,
        interactionTypeOther: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
      })
    ).isRequired,
    submittedAt: PropTypes.string.isRequired,
  }).isRequired,
};

export default OutputPreview;
