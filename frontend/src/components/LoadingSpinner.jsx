import React, { useState, useEffect } from 'react';

const LoadingSpinner = ({ message = "Loading...", showProgress = false }) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    if (!showProgress) return;

    const messages = [
      "🔄 Starting server...",
      "⚡ Connecting to database...",
      "🔐 Checking authentication...",
      "📝 Loading your tasks...",
      "✨ Almost ready!"
    ];

    let messageIndex = 0;
    let progressValue = 0;

    const interval = setInterval(() => {
      progressValue += Math.random() * 15 + 5; // Random progress between 5-20%
      
      if (progressValue > 100) {
        progressValue = 100;
        clearInterval(interval);
      }

      setProgress(progressValue);

      // Update message based on progress
      const newMessageIndex = Math.floor((progressValue / 100) * messages.length);
      if (newMessageIndex !== messageIndex && newMessageIndex < messages.length) {
        messageIndex = newMessageIndex;
        setCurrentMessage(messages[messageIndex]);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [showProgress]);

  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p className="loading-message">{currentMessage}</p>
        
        {showProgress && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{Math.round(progress)}%</span>
          </div>
        )}
        
        <div className="loading-tips">
          <p>💡 <strong>Why is this slow?</strong></p>
          <p>• Free tier server sleeps after 15 minutes</p>
          <p>• First load takes 30-60 seconds</p>
          <p>• Subsequent loads are much faster!</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
