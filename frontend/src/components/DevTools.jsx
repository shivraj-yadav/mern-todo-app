import React, { useState } from 'react';

const DevTools = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([]);

  if (!import.meta.env.DEV) return null;

  const clearCache = () => {
    sessionStorage.clear();
    localStorage.clear();
    setLogs(prev => [...prev, `🗑️ ${new Date().toLocaleTimeString()} - Cache cleared`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const simulateSlowNetwork = () => {
    // Add artificial delay to requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return originalFetch(...args);
    };
    
    setLogs(prev => [...prev, `🐌 ${new Date().toLocaleTimeString()} - Slow network simulation enabled`]);
    
    // Reset after 30 seconds
    setTimeout(() => {
      window.fetch = originalFetch;
      setLogs(prev => [...prev, `⚡ ${new Date().toLocaleTimeString()} - Network speed restored`]);
    }, 30000);
  };

  const testErrorHandling = async () => {
    try {
      await fetch('/api/test-error-404');
    } catch (error) {
      setLogs(prev => [...prev, `❌ ${new Date().toLocaleTimeString()} - Error test: ${error.message}`]);
    }
  };

  return (
    <>
      <button 
        className="dev-tools-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Development Tools"
      >
        🛠️
      </button>
      
      {isOpen && (
        <div className="dev-tools-panel">
          <div className="dev-tools-header">
            <h3>🛠️ Dev Tools</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="dev-tools-actions">
            <button onClick={clearCache} className="dev-btn">
              🗑️ Clear Cache
            </button>
            
            <button onClick={simulateSlowNetwork} className="dev-btn">
              🐌 Slow Network (30s)
            </button>
            
            <button onClick={testErrorHandling} className="dev-btn">
              ❌ Test 404 Error
            </button>
            
            <button onClick={clearLogs} className="dev-btn">
              📝 Clear Logs
            </button>
          </div>
          
          <div className="dev-tools-info">
            <div className="info-item">
              <strong>Environment:</strong> {import.meta.env.MODE}
            </div>
            <div className="info-item">
              <strong>API URL:</strong> {import.meta.env.VITE_API_URL}
            </div>
            <div className="info-item">
              <strong>Cache Items:</strong> {Object.keys(sessionStorage).length}
            </div>
          </div>
          
          {logs.length > 0 && (
            <div className="dev-tools-logs">
              <h4>📋 Logs</h4>
              <div className="logs-container">
                {logs.slice(-5).map((log, index) => (
                  <div key={index} className="log-item">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DevTools;
