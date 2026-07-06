import PropTypes from 'prop-types';
import { MAX_OTHER_TEXT_LENGTH } from '../../constants/ui';

const InteractionTypeSelect = ({
  label,
  options,
  value,
  otherValue,
  onChange,
  onOtherChange,
  onKeyDown,
  error,
  otherError,
}) => {
  return (
    <>
      <div className="form-group">
        <label>
          {label} <span className="required">*</span>
        </label>
        <select
          value={value}
          onChange={onChange}
          className={error ? 'error' : ''}
        >
          {options.map((interaction) => (
            <option
              key={interaction.value}
              value={interaction.value}
              disabled={interaction.disabled}
            >
              {interaction.label}
            </option>
          ))}
        </select>
        {error && <div className="field-error">{error}</div>}
      </div>

      {value === 'other' && (
        <div className="form-group">
          <label>
            Specify interaction: <span className="required">*</span>
          </label>
          <input
            type="text"
            value={otherValue}
            onChange={onOtherChange}
            onKeyDown={onKeyDown}
            maxLength={MAX_OTHER_TEXT_LENGTH}
            placeholder="Enter interaction type..."
            className={otherError ? 'error' : ''}
          />
          {otherError && <div className="field-error">{otherError}</div>}
        </div>
      )}
    </>
  );
};

InteractionTypeSelect.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  value: PropTypes.string.isRequired,
  otherValue: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onOtherChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  error: PropTypes.string,
  otherError: PropTypes.string,
};

export default InteractionTypeSelect;
