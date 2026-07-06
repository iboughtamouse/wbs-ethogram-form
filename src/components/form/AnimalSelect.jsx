import PropTypes from 'prop-types';
import { useConfig } from '../../contexts/ConfigContext';
import { withCurrentValue } from '../../utils/selectOptions';
import { MAX_OTHER_TEXT_LENGTH } from '../../constants/ui';

const AnimalSelect = ({
  value,
  otherValue,
  onChange,
  onOtherChange,
  onKeyDown,
  error,
  otherError,
}) => {
  const { ANIMAL_TYPES, lookupVocabLabel } = useConfig();
  const options = withCurrentValue(ANIMAL_TYPES, value, (v) =>
    lookupVocabLabel('animal', v)
  );

  return (
    <>
      <div className="form-group">
        <label>
          Animal <span className="required">*</span>
        </label>
        <select
          value={value}
          onChange={onChange}
          className={error ? 'error' : ''}
        >
          {options.map((animal) => (
            <option
              key={animal.value}
              value={animal.value}
              disabled={animal.disabled}
            >
              {animal.label}
            </option>
          ))}
        </select>
        {error && <div className="field-error">{error}</div>}
      </div>

      {value === 'other' && (
        <div className="form-group">
          <label>
            Specify animal: <span className="required">*</span>
          </label>
          <input
            type="text"
            value={otherValue}
            onChange={onOtherChange}
            onKeyDown={onKeyDown}
            maxLength={MAX_OTHER_TEXT_LENGTH}
            placeholder="Enter animal type..."
            className={otherError ? 'error' : ''}
          />
          {otherError && <div className="field-error">{otherError}</div>}
        </div>
      )}
    </>
  );
};

AnimalSelect.propTypes = {
  value: PropTypes.string.isRequired,
  otherValue: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onOtherChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  error: PropTypes.string,
  otherError: PropTypes.string,
};

export default AnimalSelect;
