import PropTypes from 'prop-types';
import { INTERACTION_TYPES } from '../../constants';

const InteractionTypeSelect = ({
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
          Interaction Type <span className="required">*</span>
        </label>
        <select
          value={value}
          onChange={onChange}
          className={error ? 'error' : ''}
        >
          {INTERACTION_TYPES.map((interaction) => (
            <option key={interaction.value} value={interaction.value}>
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
  value: PropTypes.string.isRequired,
  otherValue: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onOtherChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  error: PropTypes.string,
  otherError: PropTypes.string,
};

export default InteractionTypeSelect;
