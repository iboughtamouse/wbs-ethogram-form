import React from 'react';

const MetadataSection = ({ metadata, fieldErrors, onChange }) => {
  return (
    <div className="section">
      <h2 className="section-title">Observer Information</h2>
      <div className="metadata-grid">
        <div className="form-group">
          <label>
            Discord Username <span className="required">*</span>
          </label>
          <input
            type="text"
            value={metadata.observerName}
            onChange={(e) => onChange('observerName', e.target.value)}
            onBlur={(e) => onChange('observerName', e.target.value, true)}
            placeholder="Enter your Discord username"
            className={fieldErrors.observerName ? 'error' : ''}
          />
          {fieldErrors.observerName && (
            <div className="field-error">{fieldErrors.observerName}</div>
          )}
        </div>

        <div className="form-group">
          <label>
            Date <span className="required">*</span>
          </label>
          <input
            type="date"
            value={metadata.date}
            onChange={(e) => onChange('date', e.target.value)}
            onBlur={(e) => onChange('date', e.target.value, true)}
            className={fieldErrors.date ? 'error' : ''}
          />
          {fieldErrors.date && (
            <div className="field-error">{fieldErrors.date}</div>
          )}
        </div>

        <div className="form-group">
          <label>
            Time Window <span className="required">*</span>
          </label>
          <input
            type="text"
            value={metadata.timeWindow}
            onChange={(e) => onChange('timeWindow', e.target.value)}
            onBlur={(e) => onChange('timeWindow', e.target.value, true)}
            placeholder="e.g., 0:00 - 0:55"
            className={fieldErrors.timeWindow ? 'error' : ''}
          />
          {fieldErrors.timeWindow && (
            <div className="field-error">{fieldErrors.timeWindow}</div>
          )}
        </div>

        <div className="form-group">
          <label>Aviary</label>
          <input
            type="text"
            value={metadata.aviary}
            readOnly
            disabled
          />
        </div>

        <div className="form-group">
          <label>Patient</label>
          <input
            type="text"
            value={metadata.patient}
            readOnly
            disabled
          />
        </div>
      </div>
    </div>
  );
};

export default MetadataSection;
