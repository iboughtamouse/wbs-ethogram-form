import { useState, useEffect } from 'react';
import { generateTimeSlots } from './utils/timeUtils';
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
    startTime: '',
    endTime: '',
    aviary: "Sayyida's Cove",
    patient: 'Sayyida'
  });

  const [timeSlots, setTimeSlots] = useState([]);
  const [observations, setObservations] = useState({});
  const [showOutput, setShowOutput] = useState(false);

  // Generate time slots when start/end time changes
  useEffect(() => {
    if (metadata.startTime && metadata.endTime) {
      const slots = generateTimeSlots(metadata.startTime, metadata.endTime);
      setTimeSlots(slots);
      
      // Initialize observations for new slots
      const newObservations = {};
      slots.forEach(time => {
        // Keep existing observation if it exists, otherwise create new
        newObservations[time] = observations[time] || { behavior: '', location: '', notes: '' };
      });
      setObservations(newObservations);
    } else {
      setTimeSlots([]);
      setObservations({});
    }
  }, [metadata.startTime, metadata.endTime]);

  const {
    fieldErrors,
    validateForm,
    validateSingleMetadataField,
    validateSingleObservationField,
    clearFieldError,
    clearAllErrors
  } = useFormValidation();

  const handleMetadataChange = (field, value, shouldValidate = false) => {
    const updatedMetadata = { ...metadata, [field]: value };
    setMetadata(updatedMetadata);
    
    // Clear error when user starts typing
    if (!shouldValidate && fieldErrors[field]) {
      clearFieldError(field);
    }
    
    // Validate on blur
    if (shouldValidate) {
      validateSingleMetadataField(field, value, updatedMetadata);
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
      startTime: '',
      endTime: '',
      aviary: "Sayyida's Cove",
      patient: 'Sayyida'
    });
    setTimeSlots([]);
    setObservations({});
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
          {timeSlots.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>
              Please select a time range above to begin entering observations.
            </div>
          ) : (
            <div className="time-slots">
              {timeSlots.map((time) => (
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
          )}
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
