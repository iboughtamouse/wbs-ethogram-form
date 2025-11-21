import React from 'react';
import PropTypes from 'prop-types';
import { BEHAVIORS } from '../../constants';

const BehaviorSelect = ({ value, onChange, error }) => {
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
        {BEHAVIORS.map((behavior) => (
          <option key={behavior.value} value={behavior.value}>
            {behavior.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="field-error">{error}</div>
      )}
    </div>
  );
};

BehaviorSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string
};

export default BehaviorSelect;
