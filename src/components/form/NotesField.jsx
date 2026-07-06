import PropTypes from 'prop-types';
import { MAX_NOTES_LENGTH } from '../../constants/ui';

const NotesField = ({ value, onChange, onKeyDown }) => {
  return (
    <div className="form-group">
      <label>Notes (optional)</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        maxLength={MAX_NOTES_LENGTH}
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
