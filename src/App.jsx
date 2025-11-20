import { useState } from 'react';
import { BEHAVIORS, TIME_SLOTS, VALID_PERCHES } from './constants';
import './App.css';

function App() {
  const today = new Date().toISOString().split('T')[0];
  
  const [metadata, setMetadata] = useState({
    observerName: '',
    date: today,
    timeWindow: '',
    aviary: "Sayyida's Cove",
    patient: 'Sayyida'
  });

  const [observations, setObservations] = useState(
    TIME_SLOTS.reduce((acc, time) => {
      acc[time] = { behavior: '', location: '', notes: '' };
      return acc;
    }, {})
  );

  const [fieldErrors, setFieldErrors] = useState({});
  const [showOutput, setShowOutput] = useState(false);

  const handleMetadataChange = (field, value) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleObservationChange = (time, field, value) => {
    setObservations(prev => ({
      ...prev,
      [time]: {
        ...prev[time],
        [field]: value,
        // Clear location if behavior doesn't require it
        ...(field === 'behavior' && !BEHAVIORS.find(b => b.value === value)?.requiresLocation 
          ? { location: '' } 
          : {})
      }
    }));
    // Clear errors for this observation when user types
    const errorKey = `${time}_${field}`;
    if (fieldErrors[errorKey]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validate metadata
    if (!metadata.observerName.trim()) {
      errors.observerName = 'Discord username is required';
    }
    if (!metadata.date) {
      errors.date = 'Date is required';
    }
    if (!metadata.timeWindow.trim()) {
      errors.timeWindow = 'Time window is required';
    }

    // Validate observations
    Object.entries(observations).forEach(([time, obs]) => {
      if (!obs.behavior) {
        errors[`${time}_behavior`] = 'Please select a behavior';
      }
      
      const behaviorDef = BEHAVIORS.find(b => b.value === obs.behavior);
      if (behaviorDef?.requiresLocation && !obs.location.trim()) {
        errors[`${time}_location`] = 'Location is required for this behavior';
      }

      // Validate perch number if location is provided
      if (obs.location && behaviorDef?.requiresLocation) {
        const locationValue = obs.location.toUpperCase().trim();
        const isValidPerch = VALID_PERCHES.some(p => 
          p.toString().toUpperCase() === locationValue
        );
        if (!isValidPerch && locationValue !== 'GROUND') {
          errors[`${time}_location`] = `Invalid perch number "${obs.location}"`;
        }
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowOutput(true);
    } else {
      setShowOutput(false);
    }
  };

  const handleReset = () => {
    setMetadata({
      observerName: '',
      date: today,
      timeWindow: '',
      aviary: "Sayyida's Cove",
      patient: 'Sayyida'
    });
    setObservations(
      TIME_SLOTS.reduce((acc, time) => {
        acc[time] = { behavior: '', location: '', notes: '' };
        return acc;
      }, {})
    );
    setFieldErrors({});
    setShowOutput(false);
  };

  const getOutputData = () => {
    return {
      metadata,
      observations,
      submittedAt: new Date().toISOString()
    };
  };

  return (
    <div className="app">
      <h1>WBS Ethogram Data Entry</h1>
      <p className="subtitle">Rehabilitation Raptor Ethogram - One Hour Section</p>

      <form onSubmit={handleSubmit}>
        {/* Metadata Section */}
        <div className="section">
          <h2 className="section-title">Observer Information</h2>
          <div className="metadata-grid">
            <div className="form-group">
              <label>
                Discord Username <span className="required">*</span>
              </label>
              <input
                type="text"
                value={metadata.observerName}
                onChange={(e) => handleMetadataChange('observerName', e.target.value)}
                placeholder="Enter your Discord username"
                className={fieldErrors.observerName ? 'error' : ''}
              />
              {fieldErrors.observerName && (
                <div className="field-error">{fieldErrors.observerName}</div>
              )}
            </div>

            <div className="form-group">
              <label>
                Date <span className="required">*</span>
              </label>
              <input
                type="date"
                value={metadata.date}
                onChange={(e) => handleMetadataChange('date', e.target.value)}
                className={fieldErrors.date ? 'error' : ''}
              />
              {fieldErrors.date && (
                <div className="field-error">{fieldErrors.date}</div>
              )}
            </div>

            <div className="form-group">
              <label>
                Time Window <span className="required">*</span>
              </label>
              <input
                type="text"
                value={metadata.timeWindow}
                onChange={(e) => handleMetadataChange('timeWindow', e.target.value)}
                placeholder="e.g., 0:00 - 0:55"
                className={fieldErrors.timeWindow ? 'error' : ''}
              />
              {fieldErrors.timeWindow && (
                <div className="field-error">{fieldErrors.timeWindow}</div>
              )}
            </div>

            <div className="form-group">
              <label>Aviary</label>
              <input
                type="text"
                value={metadata.aviary}
                readOnly
                disabled
              />
            </div>

            <div className="form-group">
              <label>Patient</label>
              <input
                type="text"
                value={metadata.patient}
                readOnly
                disabled
              />
            </div>
          </div>
        </div>

        {/* Observations Section */}
        <div className="section">
          <h2 className="section-title">Observations (5-minute intervals)</h2>
          <div className="time-slots">
            {TIME_SLOTS.map((time) => {
              const behaviorDef = BEHAVIORS.find(
                b => b.value === observations[time].behavior
              );
              const requiresLocation = behaviorDef?.requiresLocation || false;
              const behaviorError = fieldErrors[`${time}_behavior`];
              const locationError = fieldErrors[`${time}_location`];

              return (
                <div key={time} className="time-slot">
                  <div className="time-slot-header">{time}</div>
                  
                  <div className="form-group">
                    <label>
                      Behavior <span className="required">*</span>
                    </label>
                    <select
                      value={observations[time].behavior}
                      onChange={(e) => handleObservationChange(time, 'behavior', e.target.value)}
                      className={behaviorError ? 'error' : ''}
                    >
                      {BEHAVIORS.map((behavior) => (
                        <option key={behavior.value} value={behavior.value}>
                          {behavior.label}
                        </option>
                      ))}
                    </select>
                    {behaviorError && (
                      <div className="field-error">{behaviorError}</div>
                    )}
                  </div>

                  {requiresLocation && (
                    <div className="form-group location-input">
                      <label>
                        Location (Perch # or "Ground") <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        value={observations[time].location}
                        onChange={(e) => handleObservationChange(time, 'location', e.target.value)}
                        placeholder="e.g., 23, F1, Ground"
                        className={locationError ? 'error' : ''}
                      />
                      {locationError && (
                        <div className="field-error">{locationError}</div>
                      )}
                    </div>
                  )}

                  <div className="form-group">
                    <label>Notes (optional)</label>
                    <input
                      type="text"
                      value={observations[time].notes}
                      onChange={(e) => handleObservationChange(time, 'notes', e.target.value)}
                      placeholder="Any additional observations..."
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Buttons */}
        <div className="button-group">
          <button type="submit" className="btn-primary">
            Validate & Preview
          </button>
          <button type="button" onClick={handleReset} className="btn-secondary">
            Reset Form
          </button>
        </div>
      </form>

      {/* Output Preview */}
      {showOutput && Object.keys(fieldErrors).length === 0 && (
        <div className="output-preview">
          <h3>Data Preview (JSON Format)</h3>
          <p style={{ marginBottom: '15px', color: '#7f8c8d' }}>
            This is what will be submitted. In the final version, this will be converted to Excel format and emailed.
          </p>
          <pre>{JSON.stringify(getOutputData(), null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
