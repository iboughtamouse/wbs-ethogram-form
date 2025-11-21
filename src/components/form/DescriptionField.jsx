import PropTypes from 'prop-types';

const DescriptionField = ({ value, onChange, onKeyDown, error }) => {
  return (
    <div className="form-group">
      <label>
        Description <span className="required">*</span>
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Describe the behavior..."
        className={error ? 'error' : ''}
      />
      {error && <div className="field-error">{error}</div>}
    </div>
  );
};

DescriptionField.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default DescriptionField;
