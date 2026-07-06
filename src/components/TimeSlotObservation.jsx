import PropTypes from 'prop-types';
import { useConfig } from '../contexts/ConfigContext';
import { formatTo12Hour } from '../utils/timeUtils';
import { observationErrorKey, slotErrorKey } from '../utils/errorKeys';
import { GENERIC_JUVENILE_ID, GENERIC_JUVENILE_LABEL } from '../constants/ui';
import SubjectObservationCard from './SubjectObservationCard';

/**
 * One 5-minute time slot: a card per recorded subject (P2-D2), plus
 * "+ Add <subject>" buttons for the other subjects present on the
 * observation date. Slots start with the foster parent's card; the
 * single-subject workflow renders exactly one card, as before Phase 2.
 *
 * Most observers cannot tell juveniles apart (P2-D8), so naming one is
 * optional: whenever juveniles are present, a repeatable
 * "+ Add Juvenile (unidentified)" button records a generic juvenile card.
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
  const slotFull = observations.length >= 20;
  const addableSubjects = slotFull
    ? []
    : presentSubjects.filter((s) => !recordedNames.has(s.name));
  // Generic juvenile cards are repeatable (never deduped) and offered
  // whenever any juvenile is present on the date
  const canAddGenericJuvenile =
    !slotFull && presentSubjects.some((s) => s.type === 'juvenile');
  const slotError = fieldErrors[slotErrorKey(time)];

  const errorFor = (cardId, field) =>
    fieldErrors[observationErrorKey(time, cardId, field)];

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
          key={observation.cardId}
          time={time}
          observation={observation}
          isPresent={
            observation.subjectId === GENERIC_JUVENILE_ID ||
            presentNames.has(observation.subjectId)
          }
          canRemove={observations.length > 1}
          behaviorError={errorFor(observation.cardId, 'behavior')}
          locationError={errorFor(observation.cardId, 'location')}
          objectError={errorFor(observation.cardId, 'object')}
          objectOtherError={errorFor(observation.cardId, 'objectOther')}
          objectInteractionTypeError={errorFor(
            observation.cardId,
            'objectInteractionType'
          )}
          objectInteractionTypeOtherError={errorFor(
            observation.cardId,
            'objectInteractionTypeOther'
          )}
          animalError={errorFor(observation.cardId, 'animal')}
          animalOtherError={errorFor(observation.cardId, 'animalOther')}
          animalInteractionTypeError={errorFor(
            observation.cardId,
            'animalInteractionType'
          )}
          animalInteractionTypeOtherError={errorFor(
            observation.cardId,
            'animalInteractionTypeOther'
          )}
          descriptionError={errorFor(observation.cardId, 'description')}
          onChange={onChange}
          onValidate={onValidate}
          onRemove={onRemoveSubject}
        />
      ))}

      {(addableSubjects.length > 0 || canAddGenericJuvenile) && (
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
          {canAddGenericJuvenile && (
            <button
              type="button"
              className="add-subject-button"
              onClick={() =>
                onAddSubject(time, {
                  type: 'juvenile',
                  name: GENERIC_JUVENILE_ID,
                  allowDuplicate: true,
                })
              }
              title="Record a juvenile without identifying which one — most observers can't tell them apart, and that's fine"
            >
              + Add {GENERIC_JUVENILE_LABEL}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

TimeSlotObservation.propTypes = {
  time: PropTypes.string.isRequired,
  observations: PropTypes.arrayOf(
    PropTypes.shape({
      cardId: PropTypes.string.isRequired,
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
