import React, { useState } from 'react';

// Clickable badge coordinates as percentages of image dimensions
// Format: { id: perch value, x: left %, y: top %, label: display text }
const NE_PERCHES = [
  { id: '18', x: 10, y: 7, label: '18' },
  { id: '15', x: 32, y: 9, label: '15' },
  { id: '12', x: 48, y: 5, label: '12' },
  { id: '11', x: 64, y: 8, label: '11' },
  { id: '14', x: 42, y: 14, label: '14' },
  { id: '17', x: 9, y: 22, label: '17' },
  { id: '16', x: 17, y: 27, label: '16' },
  { id: '13', x: 52, y: 22, label: '13' },
  { id: '10', x: 71, y: 25, label: '10' },
  { id: '1', x: 93, y: 36, label: '1' },
  { id: '9', x: 3, y: 52, label: '9' },
  { id: 'G', x: 15, y: 63, label: 'G' },
  { id: '8', x: 26, y: 60, label: '8' },
  { id: '7', x: 45, y: 53, label: '7' },
  { id: '6', x: 54, y: 63, label: '6' },
  { id: '5', x: 59, y: 52, label: '5' },
  { id: '4', x: 73, y: 53, label: '4' },
  { id: '2', x: 87, y: 53, label: '2' },
  { id: '3', x: 92, y: 66, label: '3' },
];

const SW_PERCHES = [
  { id: '31', x: 8, y: 5, label: '31' },
  { id: 'BB2', x: 32, y: 5, label: 'BB2' },
  { id: 'BB1', x: 44, y: 5, label: 'BB1' },
  { id: '27', x: 55, y: 6, label: '27' },
  { id: 'F2', x: 72, y: 6, label: 'F2' },
  { id: '26', x: 88, y: 5, label: '26' },
  { id: '29', x: 24, y: 13, label: '29' },
  { id: '30', x: 13, y: 18, label: '30' },
  { id: '28', x: 40, y: 19, label: '28' },
  { id: '25', x: 70, y: 15, label: '25' },
  { id: '17', x: 90, y: 22, label: '17' },
  { id: '24', x: 79, y: 27, label: '24' },
  { id: '1', x: 95, y: 41, label: '1' },
  { id: '23', x: 10, y: 48, label: '23' },
  { id: 'F1', x: 32, y: 48, label: 'F1' },
  { id: '21', x: 54, y: 54, label: '21' },
  { id: '19', x: 72, y: 51, label: '19' },
  { id: '9', x: 92, y: 61, label: '9' },
  { id: 'W', x: 35, y: 59, label: 'W' },
  { id: 'G', x: 49, y: 65, label: 'G' },
  { id: '22', x: 13, y: 67, label: '22' },
  { id: '20', x: 60, y: 66, label: '20' },
];

const PerchDiagramModal = ({ isOpen, onClose, onSelectPerch, currentPerch }) => {
  const [activeTab, setActiveTab] = useState('ne');

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePerchClick = (perchId) => {
    onSelectPerch(perchId);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const perches = activeTab === 'ne' ? NE_PERCHES : SW_PERCHES;
  const imageSrc = activeTab === 'ne' ? '/images/perches-ne.png' : '/images/perches-sw.png';
  const imageAlt = activeTab === 'ne' 
    ? 'Perches in NE Half of Sayyida\'s Cove' 
    : 'Perches in SW Half of Sayyida\'s Cove';

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
          <h2 id="perch-modal-title">Select Perch Location</h2>
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
            className={`perch-tab ${activeTab === 'ne' ? 'active' : ''}`}
            onClick={() => setActiveTab('ne')}
          >
            NE Half (Perches 1-18)
          </button>
          <button
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
            <div className="perch-hotspots">
              {perches.map((perch) => (
                <button
                  key={perch.id}
                  className={`perch-hotspot ${currentPerch === perch.id ? 'selected' : ''}`}
                  style={{
                    left: `${perch.x}%`,
                    top: `${perch.y}%`,
                  }}
                  onClick={() => handlePerchClick(perch.id)}
                  title={`Select ${perch.label}`}
                  aria-label={`Select perch ${perch.label}`}
                >
                  {perch.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="perch-modal-footer">
          <p className="perch-modal-hint">
            Click a perch number to select it, or press Escape to cancel.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PerchDiagramModal;
