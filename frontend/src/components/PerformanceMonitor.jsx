import React, { useState, useEffect } from 'react';

const PerformanceMonitor = ({ show = false }) => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    apiCalls: 0,
    cacheHits: 0,
    errors: 0,
    lastApiCall: null
  });

  useEffect(() => {
    if (!show || !import.meta.env.DEV) return;

    // Monitor performance metrics
    const startTime = performance.now();
    
    // Track API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      setMetrics(prev => ({ 
        ...prev, 
        apiCalls: prev.apiCalls + 1,
        lastApiCall: new Date().toLocaleTimeString()
      }));
      
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;
        
        if (import.meta.env.DEV) {
          console.log(`🚀 API Call: ${args[0]} - ${duration.toFixed(0)}ms`);
        }
        
        return response;
      } catch (error) {
        setMetrics(prev => ({ ...prev, errors: prev.errors + 1 }));
        throw error;
      }
    };

    // Track cache hits from sessionStorage
    const originalGetItem = sessionStorage.getItem;
    sessionStorage.getItem = function(key) {
      const result = originalGetItem.call(this, key);
      if (result && key.includes('/tasks')) {
        setMetrics(prev => ({ ...prev, cacheHits: prev.cacheHits + 1 }));
      }
      return result;
    };

    // Calculate load time
    setTimeout(() => {
      setMetrics(prev => ({ 
        ...prev, 
        loadTime: performance.now() - startTime 
      }));
    }, 1000);

    return () => {
      window.fetch = originalFetch;
      sessionStorage.getItem = originalGetItem;
    };
  }, [show]);

  if (!show || !import.meta.env.DEV) return null;

  return (
    <div className="performance-monitor">
      <div className="performance-header">
        <span>📊 Performance Monitor</span>
        <button 
          onClick={() => setMetrics({ loadTime: 0, apiCalls: 0, cacheHits: 0, errors: 0, lastApiCall: null })}
          className="reset-btn"
        >
          Reset
        </button>
      </div>
      
      <div className="performance-metrics">
        <div className="metric">
          <span className="metric-label">Load Time:</span>
          <span className="metric-value">{metrics.loadTime.toFixed(0)}ms</span>
        </div>
        
        <div className="metric">
          <span className="metric-label">API Calls:</span>
          <span className="metric-value">{metrics.apiCalls}</span>
        </div>
        
        <div className="metric">
          <span className="metric-label">Cache Hits:</span>
          <span className="metric-value success">{metrics.cacheHits}</span>
        </div>
        
        <div className="metric">
          <span className="metric-label">Errors:</span>
          <span className={`metric-value ${metrics.errors > 0 ? 'error' : ''}`}>
            {metrics.errors}
          </span>
        </div>
        
        {metrics.lastApiCall && (
          <div className="metric">
            <span className="metric-label">Last API:</span>
            <span className="metric-value">{metrics.lastApiCall}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;
