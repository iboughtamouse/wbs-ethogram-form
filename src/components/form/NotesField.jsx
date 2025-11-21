import PropTypes from 'prop-types';

const NotesField = ({ value, onChange, onKeyDown }) => {
  return (
    <div className="form-group">
      <label>Notes (optional)</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Any additional observations..."
      />
    </div>
  );
};

NotesField.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
};

export default NotesField;
