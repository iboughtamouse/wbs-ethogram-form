import PropTypes from 'prop-types';
import {
  validateTimeRange,
  roundToNearestFiveMinutes,
} from '../utils/timeUtils';

const MetadataSection = ({ metadata, fieldErrors, onChange }) => {
  const handleTimeChange = (field, value) => {
    // Round to nearest 5-minute interval and validate immediately
    const roundedTime = value ? roundToNearestFiveMinutes(value) : '';
    onChange(field, roundedTime, true);
  };

  // Prevent Enter key from submitting form, but trigger validation
  const handleKeyDown = (field) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Trigger validation with current value
      onChange(field, e.target.value, true);
    }
  };

  // Check for time range validation error
  const timeRangeError =
    metadata.startTime && metadata.endTime
      ? validateTimeRange(metadata.startTime, metadata.endTime).error
      : null;

  // Mode-specific help text
  const timeRangeHelpText =
    metadata.mode === 'live'
      ? "Enter times in YOUR local time. We'll convert to WBS time automatically."
      : 'Enter times exactly as shown on stream (top left corner). These are already in WBS time.';

  return (
    <section className="section">
      <h2 className="section-title">Observer Information</h2>

      {/* Observation Mode Selector */}
      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
        <label>
          What are you observing? <span className="required">*</span>
        </label>
        <div className="mode-selector">
          <label
            className={`mode-option ${metadata.mode === 'live' ? 'selected' : ''}`}
          >
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
          <label
            className={`mode-option ${metadata.mode === 'vod' ? 'selected' : ''}`}
          >
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
            Your Name <span className="required">*</span>
          </label>
          <div className="label-help-text">
            Discord, Twitch, or any name you prefer.
          </div>
          <input
            type="text"
            value={metadata.observerName}
            onChange={(e) => onChange('observerName', e.target.value, true)}
            onKeyDown={handleKeyDown('observerName')}
            placeholder="Enter your name"
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
            onChange={(e) => onChange('date', e.target.value, true)}
            className={fieldErrors.date ? 'error' : ''}
          />
          {fieldErrors.date && (
            <div className="field-error">{fieldErrors.date}</div>
          )}
        </div>

        <div className="form-group">
          <label>
            {metadata.mode === 'live'
              ? 'Observation Time Range'
              : 'VOD Time Range'}{' '}
            <span className="required">*</span>
          </label>
          <div className="label-help-text">{timeRangeHelpText}</div>
          <div className="time-range-inputs">
            <input
              type="time"
              value={metadata.startTime}
              onChange={(e) => handleTimeChange('startTime', e.target.value)}
              className={timeRangeError || fieldErrors.startTime ? 'error' : ''}
              step="300"
            />
            <span className="time-range-divider">to</span>
            <input
              type="time"
              value={metadata.endTime}
              onChange={(e) => handleTimeChange('endTime', e.target.value)}
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
          <input type="text" value={metadata.aviary} readOnly disabled />
        </div>

        <div className="form-group">
          <label>Patient</label>
          <input type="text" value={metadata.patient} readOnly disabled />
        </div>
      </div>
    </section>
  );
};

MetadataSection.propTypes = {
  metadata: PropTypes.shape({
    observerName: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    endTime: PropTypes.string.isRequired,
    aviary: PropTypes.string.isRequired,
    patient: PropTypes.string.isRequired,
    mode: PropTypes.oneOf(['live', 'vod']).isRequired,
  }).isRequired,
  fieldErrors: PropTypes.objectOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default MetadataSection;
