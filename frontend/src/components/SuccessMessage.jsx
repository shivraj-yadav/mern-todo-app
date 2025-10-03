import React from 'react';

const SuccessMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="success-message-container">
      <div className="success-message">
        <span className="success-icon">✅</span>
        <span className="success-text">{message}</span>
        {onClose && (
          <button 
            className="success-close" 
            onClick={onClose}
            aria-label="Close success message"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default SuccessMessage;
