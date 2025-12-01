import { useState } from 'react';
import { useFormValidation } from './hooks/useFormValidation';
import { useFormState } from './hooks/useFormState';
import { useAutoSave } from './hooks/useAutoSave';
import { useSubmission } from './hooks/useSubmission';
import { useFormHandlers } from './hooks/useFormHandlers';
import { prepareOutputData } from './services/formSubmission';
import MetadataSection from './components/MetadataSection';
import TimeSlotObservation from './components/TimeSlotObservation';
import OutputPreview from './components/OutputPreview';
import SubmissionModal from './components/SubmissionModal';
import './App.css';
import { TIME_SLOT_STEP_SECONDS } from './constants/ui';
import { formatIntervalLabel } from './utils/timeUtils';

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
    restoreDraft,
  } = useFormState();

  // Form validation
  const {
    fieldErrors,
    validateForm,
    validateSingleMetadataField,
    validateSingleObservationField,
    validateObservationSlot,
    clearFieldError,
    clearAllErrors,
  } = useFormValidation();

  // Draft management and autosave
  const handleDraftRestore = (draft) => {
    restoreDraft(draft.metadata, draft.observations);
  };

  const {
    showDraftNotice,
    draftTimestamp,
    handleRestoreDraft,
    handleDiscardDraft,
  } = useAutoSave(metadata, observations, handleDraftRestore);

  // Get output data helper
  const getOutputData = () => {
    return prepareOutputData(metadata, observations);
  };

  // Submission management
  const submission = useSubmission(getOutputData, resetForm, clearAllErrors);

  // Form handlers
  const {
    onMetadataChange,
    onObservationChange,
    onObservationValidate,
    onCopyToNext,
    onReset,
  } = useFormHandlers({
    metadata,
    observations,
    fieldErrors,
    handleMetadataChange,
    handleObservationChange,
    handleCopyToNext,
    resetForm,
    validateSingleMetadataField,
    validateSingleObservationField,
    validateObservationSlot,
    clearFieldError,
    clearAllErrors,
    setShowOutput,
  });

  // Form submission - validate then open modal
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm(metadata, observations)) {
      // Show output preview and open submission modal
      setShowOutput(true);
      submission.handleOpen();
    } else {
      setShowOutput(false);
      // Scroll to first error
      const firstError = document.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Compute time step label for the observation header
  const STEP_MINUTES = TIME_SLOT_STEP_SECONDS / 60;
  const intervalLabel = formatIntervalLabel(STEP_MINUTES);

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
            <h2 className="section-title">
              Observations ({intervalLabel} intervals)
            </h2>
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
                      onCopyToNext={onCopyToNext}
                      isLastSlot={index === timeSlots.length - 1}
                    />
                  );
                })}
              </div>
            )}
          </section>

          <div className="button-group">
            <button type="submit" className="btn-primary">
              Submit Observation
            </button>
            <button type="button" onClick={onReset} className="btn-secondary">
              Reset Form
            </button>
          </div>
        </form>

        {showOutput && Object.keys(fieldErrors).length === 0 && (
          <OutputPreview data={getOutputData()} />
        )}
      </main>

      {/* Submission Modal */}
      <SubmissionModal
        isOpen={submission.showModal}
        onClose={() => {
          submission.handleClose();
          setShowOutput(false);
        }}
        submissionState={submission.submissionState}
        errorMessage={submission.submissionError}
        isTransientError={submission.isTransientError}
        email={submission.submissionEmail}
        emailError={submission.emailError}
        shareSuccessMessage={submission.shareSuccessMessage}
        onEmailChange={submission.handleEmailChange}
        onEmailSubmit={submission.handleShare}
        onDownload={submission.handleDownload}
        onRetry={submission.handleRetry}
      />
    </div>
  );
}

export default App;
