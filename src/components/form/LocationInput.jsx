import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import PerchDiagramModal from '../PerchDiagramModal';

const LocationInput = ({
  value,
  onChange,
  error,
  behaviorValue,
  perchOptions,
  selectedLocationOption,
  selectStyles
}) => {
  const [isPerchModalOpen, setIsPerchModalOpen] = useState(false);

  const label = behaviorValue === 'jumping' ? 'Starting Location' : 'Location';

  return (
    <div className="form-group location-input">
      <label>
        {label} (Perch # or "Ground") <span className="required">*</span>
      </label>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Select
            options={perchOptions}
            value={selectedLocationOption}
            onChange={onChange}
            placeholder="Type or select..."
            isClearable
            styles={selectStyles}
          />
        </div>
        <button
          type="button"
          className="view-perch-map-btn"
          onClick={() => setIsPerchModalOpen(true)}
          title="Open perch diagram to select location"
        >
          <span className="map-icon">🗺️</span>
          Map
        </button>
      </div>
      {error && (
        <div className="field-error">{error}</div>
      )}
      <PerchDiagramModal
        isOpen={isPerchModalOpen}
        onClose={() => setIsPerchModalOpen(false)}
      />
    </div>
  );
};

LocationInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  behaviorValue: PropTypes.string.isRequired,
  perchOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired
        })
      ).isRequired
    })
  ).isRequired,
  selectedLocationOption: PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  }),
  selectStyles: PropTypes.objectOf(PropTypes.func).isRequired
};

export default LocationInput;
