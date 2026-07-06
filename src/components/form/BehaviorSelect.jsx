import PropTypes from 'prop-types';
import { BEHAVIORS, getGroupedBehaviors } from '../../constants';

const PLACEHOLDER = BEHAVIORS.find((b) => b.value === '');

const BehaviorSelect = ({ value, onChange, error }) => {
  const groups = getGroupedBehaviors();

  return (
    <div className="form-group">
      <label>
        Behavior <span className="required">*</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? 'error' : ''}
      >
        {PLACEHOLDER && (
          <option value={PLACEHOLDER.value}>{PLACEHOLDER.label}</option>
        )}
        {groups.map(({ group, options }) => (
          <optgroup key={group} label={group}>
            {options.map((behavior) => (
              <option key={behavior.value} value={behavior.value}>
                {behavior.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {error && <div className="field-error">{error}</div>}
    </div>
  );
};

BehaviorSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default BehaviorSelect;
