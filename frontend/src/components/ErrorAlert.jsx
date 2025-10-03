import React, { useEffect } from 'react';

const ErrorAlert = ({ error, onClose, autoClose = true }) => {
  useEffect(() => {
    if (error && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [error, onClose, autoClose]);

  if (!error) return null;

  return (
    <div className="error-alert">
      <div className="error-alert-content">
        <span className="error-icon">⚠️</span>
        <span className="error-message">{error}</span>
        <button 
          className="error-close-btn" 
          onClick={onClose}
          type="button"
          aria-label="Close error"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ErrorAlert;
