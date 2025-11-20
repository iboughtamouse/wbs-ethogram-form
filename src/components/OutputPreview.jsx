import React from 'react';

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

export default OutputPreview;
