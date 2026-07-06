import PropTypes from 'prop-types';
import { useConfig } from '../contexts/ConfigContext';
import { formatTo12Hour } from '../utils/timeUtils';
import { observationErrorKey, slotErrorKey } from '../utils/errorKeys';
import SubjectObservationCard from './SubjectObservationCard';

/**
 * One 5-minute time slot: a card per recorded subject (P2-D2), plus
 * "+ Add <subject>" buttons for the other subjects present on the
 * observation date. Slots start with the foster parent's card; the
 * single-subject workflow renders exactly one card, as before Phase 2.
 */
const TimeSlotObservation = ({
  time,
  observations,
  observationDate,
  fieldErrors,
  onChange,
  onValidate,
  onAddSubject,
  onRemoveSubject,
  onCopyToNext,
  isLastSlot,
}) => {
  const { getSubjectsPresentOn } = useConfig();

  const presentSubjects = getSubjectsPresentOn(observationDate);
  const presentNames = new Set(presentSubjects.map((s) => s.name));
  const recordedNames = new Set(observations.map((o) => o.subjectId));
  // The backend caps a slot at 20 subject entries — stop offering more
  const addableSubjects =
    observations.length >= 20
      ? []
      : presentSubjects.filter((s) => !recordedNames.has(s.name));
  const slotError = fieldErrors[slotErrorKey(time)];

  const errorFor = (subjectId, field) =>
    fieldErrors[observationErrorKey(time, subjectId, field)];

  // Convert 24-hour time to 12-hour format for display
  const displayTime = formatTo12Hour(time);

  return (
    <div className="time-slot" data-time={time}>
      <div className="time-slot-header">
        <span className="time-slot-time">{displayTime}</span>
        {!isLastSlot && (
          <button
            type="button"
            onClick={() => onCopyToNext(time)}
            className="copy-to-next-button"
            title="Copy this time slot's observations to the next time slot"
          >
            Copy to next
          </button>
        )}
      </div>

      {slotError && <div className="field-error error">{slotError}</div>}

      {observations.map((observation) => (
        <SubjectObservationCard
          key={observation.subjectId}
          time={time}
          observation={observation}
          isPresent={presentNames.has(observation.subjectId)}
          canRemove={observations.length > 1}
          behaviorError={errorFor(observation.subjectId, 'behavior')}
          locationError={errorFor(observation.subjectId, 'location')}
          objectError={errorFor(observation.subjectId, 'object')}
          objectOtherError={errorFor(observation.subjectId, 'objectOther')}
          objectInteractionTypeError={errorFor(
            observation.subjectId,
            'objectInteractionType'
          )}
          objectInteractionTypeOtherError={errorFor(
            observation.subjectId,
            'objectInteractionTypeOther'
          )}
          animalError={errorFor(observation.subjectId, 'animal')}
          animalOtherError={errorFor(observation.subjectId, 'animalOther')}
          animalInteractionTypeError={errorFor(
            observation.subjectId,
            'animalInteractionType'
          )}
          animalInteractionTypeOtherError={errorFor(
            observation.subjectId,
            'animalInteractionTypeOther'
          )}
          descriptionError={errorFor(observation.subjectId, 'description')}
          onChange={onChange}
          onValidate={onValidate}
          onRemove={onRemoveSubject}
        />
      ))}

      {addableSubjects.length > 0 && (
        <div className="add-subject-row">
          {addableSubjects.map((subject) => (
            <button
              key={subject.name}
              type="button"
              className="add-subject-button"
              onClick={() => onAddSubject(time, subject)}
              title={`Record an observation for ${subject.name} in this time slot`}
            >
              + Add {subject.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

TimeSlotObservation.propTypes = {
  time: PropTypes.string.isRequired,
  observations: PropTypes.arrayOf(
    PropTypes.shape({
      subjectType: PropTypes.string.isRequired,
      subjectId: PropTypes.string.isRequired,
      behavior: PropTypes.string.isRequired,
    })
  ).isRequired,
  observationDate: PropTypes.string.isRequired,
  fieldErrors: PropTypes.objectOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  onValidate: PropTypes.func.isRequired,
  onAddSubject: PropTypes.func.isRequired,
  onRemoveSubject: PropTypes.func.isRequired,
  onCopyToNext: PropTypes.func.isRequired,
  isLastSlot: PropTypes.bool.isRequired,
};

export default TimeSlotObservation;
