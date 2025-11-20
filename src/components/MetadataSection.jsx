import React from 'react';
import { validateTimeRange, roundToNearestFiveMinutes } from '../utils/timeUtils';

const MetadataSection = ({ metadata, fieldErrors, onChange }) => {
  const handleTimeChange = (field, value) => {
    // Round to nearest 5-minute interval
    const roundedTime = value ? roundToNearestFiveMinutes(value) : '';
    onChange(field, roundedTime, false);
  };

  const handleTimeBlur = (field) => {
    // Validate time range if both times are present
    if (metadata.startTime && metadata.endTime) {
      const validation = validateTimeRange(metadata.startTime, metadata.endTime);
      if (!validation.valid) {
        // Set error through onChange with validation flag
        onChange(field, metadata[field], true);
      }
    }
  };

  // Check for time range validation error
  const timeRangeError = metadata.startTime && metadata.endTime
    ? validateTimeRange(metadata.startTime, metadata.endTime).error
    : null;

  // Mode-specific help text
  const timeRangeHelpText = metadata.mode === 'live' 
    ? 'Enter times in YOUR local time. We\'ll convert to WBS time automatically.'
    : 'Enter times exactly as shown in the video timestamp (top left corner). These are already in WBS time.';

  return (
    <section className="section">
      <h2 className="section-title">Observer Information</h2>
      
      {/* Observation Mode Selector */}
      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
        <label>What are you observing? <span className="required">*</span></label>
        <div className="mode-selector">
          <label className={`mode-option ${metadata.mode === 'live' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="mode"
              value="live"
              checked={metadata.mode === 'live'}
              onChange={(e) => onChange('mode', e.target.value)}
            />
            <div className="mode-content">
              <span className="mode-icon">🔴</span>
              <div className="mode-text">
                <strong>Live Stream</strong>
                <p>Watching now - use your local time</p>
              </div>
            </div>
          </label>
          <label className={`mode-option ${metadata.mode === 'vod' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="mode"
              value="vod"
              checked={metadata.mode === 'vod'}
              onChange={(e) => onChange('mode', e.target.value)}
            />
            <div className="mode-content">
              <span className="mode-icon">📼</span>
              <div className="mode-text">
                <strong>Recorded Video (VOD)</strong>
                <p>Past stream - use video timestamps</p>
              </div>
            </div>
          </label>
        </div>
      </div>

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
            {metadata.mode === 'live' ? 'Observation Time Range' : 'VOD Time Range'} <span className="required">*</span>
          </label>
          <div className="time-range-help-text">
            {timeRangeHelpText}
          </div>
          <div className="time-range-inputs">
            <input
              type="time"
              value={metadata.startTime}
              onChange={(e) => handleTimeChange('startTime', e.target.value)}
              onBlur={() => handleTimeBlur('startTime')}
              className={timeRangeError || fieldErrors.startTime ? 'error' : ''}
              step="300"
            />
            <span className="time-range-divider">to</span>
            <input
              type="time"
              value={metadata.endTime}
              onChange={(e) => handleTimeChange('endTime', e.target.value)}
              onBlur={() => handleTimeBlur('endTime')}
              className={timeRangeError || fieldErrors.endTime ? 'error' : ''}
              step="300"
            />
          </div>
          {timeRangeError && (
            <div className="field-error">{timeRangeError}</div>
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
    </section>
  );
};

export default MetadataSection;
