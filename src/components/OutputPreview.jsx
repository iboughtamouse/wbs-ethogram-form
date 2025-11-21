import React from 'react';
import PropTypes from 'prop-types';

const OutputPreview = ({ data }) => {
  return (
    <div className="output-preview">
      <h3>Data Preview (JSON Format)</h3>
      <p style={{ marginBottom: '15px', color: '#7f8c8d' }}>
        This is what will be submitted. In the final version, this will be converted to Excel format and emailed.
      </p>
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
      mode: PropTypes.string.isRequired
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
        description: PropTypes.string.isRequired
      })
    ).isRequired,
    submittedAt: PropTypes.string.isRequired
  }).isRequired
};

export default OutputPreview;
