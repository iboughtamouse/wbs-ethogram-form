import PropTypes from 'prop-types';
import { INANIMATE_OBJECTS } from '../../constants';

const ObjectSelect = ({
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
          Object <span className="required">*</span>
        </label>
        <select
          value={value}
          onChange={onChange}
          className={error ? 'error' : ''}
        >
          {INANIMATE_OBJECTS.map((obj) => (
            <option key={obj.value} value={obj.value}>
              {obj.label}
            </option>
          ))}
        </select>
        {error && <div className="field-error">{error}</div>}
      </div>

      {value === 'other' && (
        <div className="form-group">
          <label>
            Specify object: <span className="required">*</span>
          </label>
          <input
            type="text"
            value={otherValue}
            onChange={onOtherChange}
            onKeyDown={onKeyDown}
            placeholder="Enter object name..."
            className={otherError ? 'error' : ''}
          />
          {otherError && <div className="field-error">{otherError}</div>}
        </div>
      )}
    </>
  );
};

ObjectSelect.propTypes = {
  value: PropTypes.string.isRequired,
  otherValue: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onOtherChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  error: PropTypes.string,
  otherError: PropTypes.string,
};

export default ObjectSelect;
