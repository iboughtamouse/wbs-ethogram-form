import { useState } from 'react';
import { TIME_SLOTS } from './constants';
import { useFormValidation } from './hooks/useFormValidation';
import MetadataSection from './components/MetadataSection';
import TimeSlotObservation from './components/TimeSlotObservation';
import OutputPreview from './components/OutputPreview';
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

  const [showOutput, setShowOutput] = useState(false);

  const {
    fieldErrors,
    validateForm,
    validateSingleMetadataField,
    validateSingleObservationField,
    clearFieldError,
    clearAllErrors
  } = useFormValidation();

  const handleMetadataChange = (field, value, shouldValidate = false) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (!shouldValidate && fieldErrors[field]) {
      clearFieldError(field);
    }
    
    // Validate on blur
    if (shouldValidate) {
      validateSingleMetadataField(field, value);
    }
  };

  const handleObservationChange = (time, field, value) => {
    setObservations(prev => {
      const newObservations = {
        ...prev,
        [time]: {
          ...prev[time],
          [field]: value,
          // Clear location if behavior doesn't require it
          ...(field === 'behavior' && value 
            ? {} 
            : field === 'behavior' 
              ? { location: '' } 
              : {})
        }
      };
      
      return newObservations;
    });
    
    // Clear error when user starts typing
    const errorKey = `${time}_${field}`;
    if (fieldErrors[errorKey]) {
      clearFieldError(errorKey);
    }
  };

  const handleObservationValidate = (time, field) => {
    validateSingleObservationField(time, field, observations);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm(metadata, observations)) {
      setShowOutput(true);
    } else {
      setShowOutput(false);
      // Scroll to first error
      const firstError = document.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
    clearAllErrors();
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
        <MetadataSection
          metadata={metadata}
          fieldErrors={fieldErrors}
          onChange={handleMetadataChange}
        />

        <div className="section">
          <h2 className="section-title">Observations (5-minute intervals)</h2>
          <div className="time-slots">
            {TIME_SLOTS.map((time) => (
              <TimeSlotObservation
                key={time}
                time={time}
                observation={observations[time]}
                behaviorError={fieldErrors[`${time}_behavior`]}
                locationError={fieldErrors[`${time}_location`]}
                onChange={handleObservationChange}
                onValidate={handleObservationValidate}
              />
            ))}
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="btn-primary">
            Validate & Preview
          </button>
          <button type="button" onClick={handleReset} className="btn-secondary">
            Reset Form
          </button>
        </div>
      </form>

      {showOutput && Object.keys(fieldErrors).length === 0 && (
        <OutputPreview data={getOutputData()} />
      )}
    </div>
  );
}

export default App;
