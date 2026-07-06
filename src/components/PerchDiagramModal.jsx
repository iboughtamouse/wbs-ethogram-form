import { useState } from 'react';
import PropTypes from 'prop-types';
import { useConfig } from '../contexts/ConfigContext';

/**
 * Tabbed perch-diagram reference, driven by the aviary's config
 * `perchDiagrams` list ({ url, label }) — one tab per labeled diagram, so
 * any aviary's set renders without code changes (Phase 2 §1). Images load
 * from the config URL as-is: it may be a same-origin bundled asset today or
 * an R2 URL after the owner swap, so no derived .webp variants.
 */
const PerchDiagramModal = ({ isOpen, onClose }) => {
  const { perchDiagrams, aviaryName } = useConfig();
  const [activeIndex, setActiveIndex] = useState(0);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const activeDiagram = perchDiagrams[activeIndex] ?? perchDiagrams[0] ?? null;

  return (
    <div
      className="perch-modal-backdrop"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="perch-modal-title"
    >
      <div className="perch-modal">
        <div className="perch-modal-header">
          <h2 id="perch-modal-title">Perch Reference</h2>
          <button
            className="perch-modal-close"
            onClick={onClose}
            aria-label="Close perch diagram"
          >
            ×
          </button>
        </div>

        {perchDiagrams.length > 1 && (
          <div className="perch-modal-tabs">
            {perchDiagrams.map((diagram, index) => (
              <button
                key={diagram.label}
                type="button"
                className={`perch-tab ${index === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(index)}
              >
                {diagram.label}
              </button>
            ))}
          </div>
        )}

        <div className="perch-modal-content">
          <div className="perch-diagram-container">
            {activeDiagram ? (
              <img
                src={activeDiagram.url}
                alt={`Perches: ${activeDiagram.label} — ${aviaryName}`}
                className="perch-diagram-image"
              />
            ) : (
              <p className="perch-modal-hint">
                No perch diagrams are configured for this aviary.
              </p>
            )}
          </div>
        </div>

        <div className="perch-modal-footer">
          <p className="perch-modal-hint">
            Reference the perch numbers, then type the location in the form.
          </p>
        </div>
      </div>
    </div>
  );
};

PerchDiagramModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PerchDiagramModal;
