import PropTypes from 'prop-types';
import { useConfig } from '../contexts/ConfigContext';
import {
  validateTimeRange,
  roundToNearestFiveMinutes,
} from '../utils/timeUtils';
import { TIME_SLOT_STEP_SECONDS } from '../constants/ui';

const MetadataSection = ({ metadata, fieldErrors, onChange }) => {
  const {
    aviaryOptions,
    getAviaryDisplayName,
    getSubjectsPresentOn,
    subjects,
  } = useConfig();

  // Subjects present on the observation date replace the old single-patient
  // display (P2-D2) — informational; cards are managed per time slot below.
  // Mirrors the cards' fallback: when no episode covers the date, current
  // residents are shown so the display never contradicts the default card.
  const presentSubjects = getSubjectsPresentOn(metadata.date);
  const displayedSubjects = presentSubjects.length
    ? presentSubjects
    : subjects.filter((s) => !s.departedOn);
  const subjectsCaveat = presentSubjects.length
    ? ''
    : ' (not listed for this date)';
  const handleTimeChange = (field, value) => {
    // Update state without validation - just track the raw value as user types
    onChange(field, value, false);
  };

  const handleTimeBlur = (field) => (e) => {
    // Round to nearest 5-minute interval and validate when user leaves the field
    const roundedTime = e.target.value
      ? roundToNearestFiveMinutes(e.target.value)
      : '';
    onChange(field, roundedTime, true);
  };

  // Prevent Enter key from submitting form (for text inputs like observerName)
  const handleTextKeyDown = (field) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Just validate, no rounding needed for non-time fields
      onChange(field, e.target.value, true);
    }
  };

  // Prevent Enter key from submitting form (for time inputs specifically)
  const handleTimeKeyDown = (field) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Round and validate with current value
      const roundedTime = e.target.value
        ? roundToNearestFiveMinutes(e.target.value)
        : '';
      onChange(field, roundedTime, true);
    }
  };

  // Check for time range validation error
  const timeRangeError =
    metadata.startTime && metadata.endTime
      ? validateTimeRange(metadata.startTime, metadata.endTime).error
      : null;

  // Help text for time entry (same for both modes)
  const timeRangeHelpText =
    'Enter times exactly as shown on the video timestamp (top-left corner).';

  return (
    <section className="section">
      <h2 className="section-title">Observer Information</h2>

      {/* Temporary migration notice - can be removed after Feb 2026 */}
      {metadata.mode === 'live' && (
        <div
          className="notice-banner"
          style={{
            gridColumn: '1 / -1',
            padding: '12px 16px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            marginBottom: '16px',
          }}
        >
          <strong>📢 Updated:</strong> For live streams, please use the
          timestamp shown on the video (top-left corner), not your local time.
          This ensures all observations align correctly regardless of stream
          delay.
        </div>
      )}

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
                <p>Watching now - use video timestamps</p>
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
            onKeyDown={handleTextKeyDown('observerName')}
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
              onBlur={handleTimeBlur('startTime')}
              onKeyDown={handleTimeKeyDown('startTime')}
              className={timeRangeError || fieldErrors.startTime ? 'error' : ''}
              step={TIME_SLOT_STEP_SECONDS}
            />
            <span className="time-range-divider">to</span>
            <input
              type="time"
              value={metadata.endTime}
              onChange={(e) => handleTimeChange('endTime', e.target.value)}
              onBlur={handleTimeBlur('endTime')}
              onKeyDown={handleTimeKeyDown('endTime')}
              className={timeRangeError || fieldErrors.endTime ? 'error' : ''}
              step={TIME_SLOT_STEP_SECONDS}
            />
          </div>
          {timeRangeError && (
            <div className="field-error">{timeRangeError}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="aviary">Aviary</label>
          {aviaryOptions.length > 1 ? (
            <select
              id="aviary"
              value={metadata.aviary}
              onChange={(e) => onChange('aviary', e.target.value)}
            >
              {aviaryOptions.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.name}
                </option>
              ))}
            </select>
          ) : (
            // Exactly one active aviary: auto-selected, read-only (today's UX)
            <input
              id="aviary"
              type="text"
              value={getAviaryDisplayName(metadata.aviary)}
              readOnly
              disabled
            />
          )}
        </div>

        <div className="form-group">
          <label>Subjects</label>
          <input
            type="text"
            value={
              displayedSubjects.map((s) => s.name).join(', ') + subjectsCaveat
            }
            readOnly
            disabled
            title="Subjects with a residency episode covering the selected date"
          />
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
    mode: PropTypes.oneOf(['live', 'vod']).isRequired,
  }).isRequired,
  fieldErrors: PropTypes.objectOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default MetadataSection;
