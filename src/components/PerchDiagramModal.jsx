import { useState } from 'react';
import PropTypes from 'prop-types';

const PerchDiagramModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('ne');

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

  const imageSrc =
    activeTab === 'ne' ? '/images/perches-ne.png' : '/images/perches-sw.png';
  const imageAlt =
    activeTab === 'ne'
      ? "Perches in NE Half of Sayyida's Cove"
      : "Perches in SW Half of Sayyida's Cove";

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

        <div className="perch-modal-tabs">
          <button
            type="button"
            className={`perch-tab ${activeTab === 'ne' ? 'active' : ''}`}
            onClick={() => setActiveTab('ne')}
          >
            NE Half (Perches 1-18)
          </button>
          <button
            type="button"
            className={`perch-tab ${activeTab === 'sw' ? 'active' : ''}`}
            onClick={() => setActiveTab('sw')}
          >
            SW Half (Perches 19-31, BB, F, W)
          </button>
        </div>

        <div className="perch-modal-content">
          <div className="perch-diagram-container">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="perch-diagram-image"
            />
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
