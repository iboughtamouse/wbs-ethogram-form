import { useState } from 'react';
import { clearDraft } from './utils/localStorageUtils';
import { useFormValidation } from './hooks/useFormValidation';
import { useFormState } from './hooks/useFormState';
import { useAutoSave } from './hooks/useAutoSave';
import { prepareOutputData } from './services/formSubmission';
import {
  submitObservation,
  isRetryableError,
  getErrorMessage,
} from './services/emailService';
import { validateEmailInput, parseEmailList } from './utils/validators';
import MetadataSection from './components/MetadataSection';
import TimeSlotObservation from './components/TimeSlotObservation';
import OutputPreview from './components/OutputPreview';
import SubmissionModal, {
  SUBMISSION_STATES,
} from './components/SubmissionModal';
import './App.css';

function App() {
  const [showOutput, setShowOutput] = useState(false);

  // Submission modal state
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionState, setSubmissionState] = useState(
    SUBMISSION_STATES.GENERATING
  );
  const [submissionEmail, setSubmissionEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const [isTransientError, setIsTransientError] = useState(false);

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

  // Copy to next handler with validation
  const onCopyToNext = (time) => {
    // Validate the current observation slot before copying
    const validation = validateObservationSlot(time, observations);

    if (!validation.valid) {
      // Validation failed - errors are already set in state
      // Scroll to first error in this time slot (if scrollIntoView is available)
      const firstError = document.querySelector(`[data-time="${time}"] .error`);
      if (firstError && firstError.scrollIntoView) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    // Validation passed - proceed with copy
    return handleCopyToNext(time);
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

  // Handle Excel generation and modal opening
  const handleGenerateExcel = async () => {
    // Set modal to generating state
    setSubmissionState(SUBMISSION_STATES.GENERATING);
    setShowSubmissionModal(true);

    // Show loading state briefly to demonstrate the generating phase
    // In production, the actual Excel generation happens on-demand during download
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Transition to ready state
    setSubmissionState(SUBMISSION_STATES.READY);
  };

  // Handle email input change with validation
  const handleEmailChange = (value) => {
    setSubmissionEmail(value);

    // Validate email
    const error = validateEmailInput(value);
    setEmailError(error);
  };

  // Handle email submission
  const handleEmailSubmit = async () => {
    // Validate email before submitting
    const error = validateEmailInput(submissionEmail);
    if (error) {
      setEmailError(error);
      return;
    }

    // Parse email(s) into array using shared utility
    const { emails } = parseEmailList(submissionEmail);

    // Set submitting state
    setSubmissionState(SUBMISSION_STATES.SUBMITTING);

    // Prepare form data for submission
    const formData = getOutputData();

    try {
      // Submit observation
      const result = await submitObservation(formData, emails);

      if (result.success) {
        // Success - show success state
        setSubmissionState(SUBMISSION_STATES.SUCCESS);
        setSubmissionError('');
        setIsTransientError(false);

        // Clear draft after successful submission
        clearDraft();
      } else {
        // Error - show error state
        setSubmissionState(SUBMISSION_STATES.ERROR);
        setSubmissionError(getErrorMessage(result));
        setIsTransientError(isRetryableError(result));
      }
    } catch (error) {
      // Unexpected error
      setSubmissionState(SUBMISSION_STATES.ERROR);
      setSubmissionError('An unexpected error occurred. Please try again.');
      setIsTransientError(true);
    }
  };

  // Handle retry after error
  const handleRetry = () => {
    // Reset to ready state so user can try again
    setSubmissionState(SUBMISSION_STATES.READY);
    setSubmissionError('');
  };

  // Handle Excel download from modal
  const handleDownloadExcel = async () => {
    try {
      // Dynamically import the Excel generator
      const { downloadExcelFile } = await import(
        './services/export/excelGenerator'
      );

      // Prepare the data
      const data = getOutputData();

      // Sanitize patient name for filename
      const sanitizedPatient = data.metadata.patient.replace(
        /[/\\:*?"<>|]/g,
        '_'
      );
      const filename = `ethogram-${sanitizedPatient}-${data.metadata.date}`;

      // Download the file
      await downloadExcelFile(data, filename);
    } catch (error) {
      console.error('Failed to generate Excel file:', error);
      alert('Failed to generate Excel file. Please try again.');
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    // If closing after successful submission, reset the form
    if (submissionState === SUBMISSION_STATES.SUCCESS) {
      resetForm();
      clearAllErrors();
      setShowOutput(false);
    }

    // Reset modal state for next time
    setShowSubmissionModal(false);
    setSubmissionState(SUBMISSION_STATES.GENERATING);
    setSubmissionEmail('');
    setEmailError('');
    setSubmissionError('');
    setIsTransientError(false);
  };

  // Form submission - now opens modal instead of just showing output
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm(metadata, observations)) {
      // Show output preview AND generate Excel for submission
      setShowOutput(true);
      handleGenerateExcel();
    } else {
      setShowOutput(false);
      // Scroll to first error
      const firstError = document.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
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

      {/* Submission Modal */}
      <SubmissionModal
        isOpen={showSubmissionModal}
        onClose={handleCloseModal}
        submissionState={submissionState}
        errorMessage={submissionError}
        isTransientError={isTransientError}
        email={submissionEmail}
        emailError={emailError}
        onEmailChange={handleEmailChange}
        onEmailSubmit={handleEmailSubmit}
        onDownload={handleDownloadExcel}
        onRetry={handleRetry}
      />
    </div>
  );
}

export default App;
