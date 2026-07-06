import PropTypes from 'prop-types';
import { useConfig } from '../../contexts/ConfigContext';

const BehaviorSelect = ({ value, onChange, error }) => {
  const { getGroupedBehaviors, getBehaviorByValue } = useConfig();
  const groups = getGroupedBehaviors();

  // Keep-listed rule: a draft-held value that is no longer in the menu
  // (retired or disabled since the draft was saved) stays renderable as a
  // disabled option instead of blanking the select.
  const valueInMenu =
    !value ||
    groups.some(({ options }) => options.some((b) => b.value === value));
  const retiredLabel = valueInMenu
    ? null
    : `${getBehaviorByValue(value)?.label ?? value} (retired)`;

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
        <option value="">Select a behavior...</option>
        {groups.map(({ group, options }) => (
          <optgroup key={group} label={group}>
            {options.map((behavior) => (
              <option key={behavior.value} value={behavior.value}>
                {behavior.label}
              </option>
            ))}
          </optgroup>
        ))}
        {retiredLabel && (
          <option value={value} disabled>
            {retiredLabel}
          </option>
        )}
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
