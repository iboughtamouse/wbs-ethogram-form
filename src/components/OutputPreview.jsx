import PropTypes from 'prop-types';

/**
 * OutputPreview displays a read-only JSON preview of the observation data.
 *
 * Note: In Phase 1, the download functionality was moved to SubmissionModal.
 * This component now serves purely as a data preview for debugging/verification.
 */

const OutputPreview = ({ data }) => {
  return (
    <div className="output-preview">
      <h3>Data Preview</h3>
      <p style={{ marginBottom: '15px', color: '#7f8c8d' }}>
        Your observation data is ready for submission. Use the submission modal
        to send via email or download the Excel file.
      </p>

      <details style={{ marginTop: '20px' }}>
        <summary
          style={{
            cursor: 'pointer',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#2c3e50',
          }}
        >
          Show JSON Preview (for debugging)
        </summary>
        <pre style={{ marginTop: '10px' }}>{JSON.stringify(data, null, 2)}</pre>
      </details>
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
