import { useState } from 'react';
import { clearDraft } from './utils/localStorageUtils';
import { useFormValidation } from './hooks/useFormValidation';
import { useFormState } from './hooks/useFormState';
import { useAutoSave } from './hooks/useAutoSave';
import { prepareOutputData } from './services/formSubmission';
import MetadataSection from './components/MetadataSection';
import TimeSlotObservation from './components/TimeSlotObservation';
import OutputPreview from './components/OutputPreview';
import './App.css';

function App() {
  const [showOutput, setShowOutput] = useState(false);

  // Form state management
  const {
    metadata,
    timeSlots,
    observations,
    handleMetadataChange,
    handleObservationChange,
    handleCopyToNext,
    resetForm,
    setMetadata,
    setObservations,
  } = useFormState();

  // Form validation
  const {
    fieldErrors,
    validateForm,
    validateSingleMetadataField,
    validateSingleObservationField,
    clearFieldError,
    clearAllErrors,
  } = useFormValidation();

  // Draft management and autosave
  const handleDraftRestore = (draft) => {
    setMetadata(draft.metadata);
    // Time slots will regenerate via useEffect in useFormState
    // but we need to restore observations after slots are set
    setTimeout(() => {
      setObservations(draft.observations);
    }, 0);
  };

  const {
    showDraftNotice,
    draftTimestamp,
    handleRestoreDraft,
    handleDiscardDraft,
  } = useAutoSave(metadata, observations, handleDraftRestore);

  // Metadata change handler with validation
  const onMetadataChange = (field, value, shouldValidate = false) => {
    handleMetadataChange(field, value);

    // Clear error when user starts typing
    if (!shouldValidate && fieldErrors[field]) {
      clearFieldError(field);
    }

    // Validate on blur
    if (shouldValidate) {
      // Need to construct updated metadata for validation
      const updatedMetadata = { ...metadata, [field]: value };
      validateSingleMetadataField(field, value, updatedMetadata);
    }
  };

  // Observation change handler
  const onObservationChange = (time, field, value) => {
    handleObservationChange(time, field, value);

    // Clear error when user starts typing
    const errorKey = `${time}_${field}`;
    if (fieldErrors[errorKey]) {
      clearFieldError(errorKey);
    }
  };

  // Observation validation handler
  const onObservationValidate = (time, field, currentValue = null) => {
    validateSingleObservationField(time, field, observations, currentValue);
  };

  // Form submission
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

  // Form reset
  const handleReset = () => {
    resetForm();
    clearAllErrors();
    setShowOutput(false);
    clearDraft();
  };

  // Get output data with timezone conversion
  const getOutputData = () => {
    return prepareOutputData(metadata, observations);
  };

  return (
    <div className="app">
      <header>
        <h1>WBS Ethogram Data Entry</h1>
        <p className="subtitle">
          Rehabilitation Raptor Ethogram - One Hour Section
        </p>
      </header>

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

      <main>
        <form onSubmit={handleSubmit}>
          <MetadataSection
            metadata={metadata}
            fieldErrors={fieldErrors}
            onChange={onMetadataChange}
          />

          <section className="section">
            <h2 className="section-title">Observations (5-minute intervals)</h2>
            {timeSlots.length === 0 ? (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#7f8c8d',
                }}
              >
                Please select a time range above to begin entering observations.
              </div>
            ) : (
              <div className="time-slots">
                {timeSlots.map((time, index) => {
                  // Only render if observation exists (guards against timing issues during state updates)
                  if (!observations[time]) return null;

                  return (
                    <TimeSlotObservation
                      key={time}
                      time={time}
                      observation={observations[time]}
                      behaviorError={fieldErrors[`${time}_behavior`]}
                      locationError={fieldErrors[`${time}_location`]}
                      objectError={fieldErrors[`${time}_object`]}
                      objectOtherError={fieldErrors[`${time}_objectOther`]}
                      animalError={fieldErrors[`${time}_animal`]}
                      animalOtherError={fieldErrors[`${time}_animalOther`]}
                      interactionTypeError={
                        fieldErrors[`${time}_interactionType`]
                      }
                      interactionTypeOtherError={
                        fieldErrors[`${time}_interactionTypeOther`]
                      }
                      descriptionError={fieldErrors[`${time}_description`]}
                      onChange={onObservationChange}
                      onValidate={onObservationValidate}
                      onCopyToNext={handleCopyToNext}
                      isLastSlot={index === timeSlots.length - 1}
                    />
                  );
                })}
              </div>
            )}
          </section>

          <div className="button-group">
            <button type="submit" className="btn-primary">
              Validate & Preview
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary"
            >
              Reset Form
            </button>
          </div>
        </form>

        {showOutput && Object.keys(fieldErrors).length === 0 && (
          <OutputPreview data={getOutputData()} />
        )}
      </main>
    </div>
  );
}

export default App;
