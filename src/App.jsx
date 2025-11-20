import { useState, useEffect } from 'react';
import { generateTimeSlots } from './utils/timeUtils';
import { convertToWBSTime, getUserTimezone } from './utils/timezoneUtils';
import { saveDraft, loadDraft, clearDraft, hasDraft } from './utils/localStorageUtils';
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
    patient: 'Sayyida',
    mode: 'live' // 'live' or 'vod'
  });

  const [timeSlots, setTimeSlots] = useState([]);
  const [observations, setObservations] = useState({});
  const [showOutput, setShowOutput] = useState(false);
  const [showDraftNotice, setShowDraftNotice] = useState(false);
  const [draftTimestamp, setDraftTimestamp] = useState(null);

  // Check for saved draft on mount
  useEffect(() => {
    if (hasDraft()) {
      const draft = loadDraft();
      if (draft) {
        setShowDraftNotice(true);
        setDraftTimestamp(draft.savedAt);
      }
    }
  }, []);

  // Autosave to localStorage when metadata or observations change
  useEffect(() => {
    // Don't autosave if form is empty
    const hasData = metadata.observerName || metadata.startTime || metadata.endTime || 
                    Object.values(observations).some(obs => obs.behavior || obs.location || obs.notes);
    
    if (hasData) {
      saveDraft(metadata, observations);
    }
  }, [metadata, observations]);

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
      // Clear draft from localStorage after successful submission
      clearDraft();
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
      patient: 'Sayyida',
      mode: 'live'
    });
    setTimeSlots([]);
    setObservations({});
    clearAllErrors();
    setShowOutput(false);
    // Clear draft from localStorage
    clearDraft();
  };

  const handleRestoreDraft = () => {
    const draft = loadDraft();
    if (draft) {
      setMetadata(draft.metadata);
      // Time slots will regenerate via useEffect
      // but we need to restore observations after slots are set
      setTimeout(() => {
        setObservations(draft.observations);
      }, 0);
      setShowDraftNotice(false);
      setDraftTimestamp(null);
    }
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftNotice(false);
    setDraftTimestamp(null);
  };

  const getOutputData = () => {
    // Apply timezone conversion for live mode
    let outputMetadata = { ...metadata };
    let outputObservations = observations;
    
    if (metadata.mode === 'live') {
      // Convert times to WBS timezone
      outputMetadata.startTime = convertToWBSTime(metadata.date, metadata.startTime);
      outputMetadata.endTime = convertToWBSTime(metadata.date, metadata.endTime);
      outputMetadata.observerTimezone = getUserTimezone();
      
      // Convert observation timestamps to WBS timezone
      outputObservations = {};
      Object.entries(observations).forEach(([localTime, observation]) => {
        const wbsTime = convertToWBSTime(metadata.date, localTime);
        outputObservations[wbsTime] = observation;
      });
    }
    
    return {
      metadata: outputMetadata,
      observations: outputObservations,
      submittedAt: new Date().toISOString()
    };
  };

  return (
    <div className="app">
      <h1>WBS Ethogram Data Entry</h1>
      <p className="subtitle">Rehabilitation Raptor Ethogram - One Hour Section</p>

      {showDraftNotice && (
        <div className="draft-notice">
          <div className="draft-notice-content">
            <span className="draft-icon">💾</span>
            <div className="draft-message">
              <strong>Draft found!</strong> You have unsaved work from{' '}
              {draftTimestamp && new Date(draftTimestamp).toLocaleString()}.
            </div>
          </div>
          <div className="draft-actions">
            <button 
              type="button" 
              onClick={handleRestoreDraft} 
              className="btn-draft-restore"
            >
              Resume Draft
            </button>
            <button 
              type="button" 
              onClick={handleDiscardDraft} 
              className="btn-draft-discard"
            >
              Start Fresh
            </button>
          </div>
        </div>
      )}

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
