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

  // Help text for time entry (video timestamp guidance).
  const timeRangeHelpText =
    'Enter times exactly as shown on the video timestamp (top-left corner).';

  return (
    <section className="section">
      <h2 className="section-title">Observer Information</h2>

      <div className="metadata-grid">
        <div className="form-group metadata-field-name">
          <label>
            Your Name <span className="required">*</span>
          </label>
          <input
            type="text"
            value={metadata.observerName}
            onChange={(e) => onChange('observerName', e.target.value, true)}
            onKeyDown={handleTextKeyDown('observerName')}
            placeholder="Enter your name"
            className={fieldErrors.observerName ? 'error' : ''}
          />
          <div className="label-help-text">
            Discord, Twitch, or any name you prefer.
          </div>
          {fieldErrors.observerName && (
            <div className="field-error">{fieldErrors.observerName}</div>
          )}
        </div>

        <div className="form-group metadata-field-date">
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

        <div className="form-group metadata-field-time">
          <label>
            Observation Time Range <span className="required">*</span>
          </label>
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
          <div className="label-help-text">{timeRangeHelpText}</div>
          {timeRangeError && (
            <div className="field-error">{timeRangeError}</div>
          )}
        </div>

        {aviaryOptions.length > 1 && (
          <div className="form-group metadata-field-aviary">
            <label htmlFor="aviary">Aviary</label>
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
          </div>
        )}
      </div>

      {/* Read-only recording context. These aren't editable, so they sit
          below the fields the observer fills in, in a lighter treatment.
          With multiple active aviaries the aviary becomes an editable select
          above; with one it's shown here as read-only text. */}
      <div className="metadata-context">
        {aviaryOptions.length <= 1 && (
          <div className="metadata-context-item">
            <span className="metadata-context-label">Aviary</span>
            <span className="metadata-context-value">
              {getAviaryDisplayName(metadata.aviary)}
            </span>
          </div>
        )}
        <div
          className="metadata-context-item"
          title="Subjects with a residency episode covering the selected date"
        >
          <span className="metadata-context-label">Subjects</span>
          <span className="metadata-context-value">
            {displayedSubjects.map((s) => s.name).join(', ') + subjectsCaveat}
          </span>
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
  }).isRequired,
  fieldErrors: PropTypes.objectOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default MetadataSection;
