import React from 'react';

const AuthErrorMessage = ({ error, onClose }) => {
  if (!error) return null;

  const getErrorIcon = (error) => {
    if (error.includes('User does not exist')) return '👤';
    if (error.includes('Invalid email or password')) return '🔒';
    if (error.includes('Server error')) return '🔧';
    if (error.includes('timeout')) return '⏱️';
    if (error.includes('network') || error.includes('connection')) return '🌐';
    if (error.includes('already exists')) return '📧';
    return '⚠️';
  };

  const getErrorType = (error) => {
    if (error.includes('User does not exist')) return 'user-not-found';
    if (error.includes('Invalid email or password')) return 'invalid-credentials';
    if (error.includes('Server error')) return 'server-error';
    if (error.includes('timeout')) return 'timeout-error';
    if (error.includes('already exists')) return 'duplicate-user';
    return 'general-error';
  };

  return (
    <div className={`auth-error-message ${getErrorType(error)}`}>
      <div className="error-content">
        <span className="error-icon">{getErrorIcon(error)}</span>
        <span className="error-text">{error}</span>
      </div>
      {onClose && (
        <button 
          className="error-close" 
          onClick={onClose}
          type="button"
          aria-label="Close error message"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default AuthErrorMessage;
