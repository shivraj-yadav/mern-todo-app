import React, { useState } from 'react';
import axios from 'axios';

const ApiDebugger = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  if (!import.meta.env.DEV) return null;

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const addResult = (test, status, message, details = null) => {
    setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const testRegistration = async () => {
    setIsLoading(true);
    addResult('Registration Test', 'testing', 'Testing registration endpoint...');

    try {
      const response = await axios.get(`${API_URL}/api/health`, { timeout: 10000 });
      addResult('API Connection', 'success', 'API is reachable', response.data);
    } catch (error) {
      addResult('API Connection', 'error', 'API connection failed', {
        message: error.message,
        status: error.response?.status,
        url: `${API_URL}/api/health`
      });
    }
    setIsLoading(false);
  };

  const testAuthEndpoint = async () => {
    setIsLoading(true);
    addResult('Auth Endpoint', 'testing', 'Testing auth endpoint...');

    try {
      // Test with invalid credentials to see error response
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: 'test@example.com',
        password: 'wrongpassword'
      }, { timeout: 10000 });
      
      addResult('Auth Endpoint', 'unexpected', 'Login succeeded with wrong credentials?', response.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 404) {
        addResult('Auth Endpoint', 'success', 'Auth endpoint working correctly', {
          status: error.response.status,
          message: error.response.data?.message,
          code: error.response.data?.code
        });
      } else {
        addResult('Auth Endpoint', 'error', 'Auth endpoint error', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      }
    }
    setIsLoading(false);
  };

  const testCors = async () => {
    setIsLoading(true);
    addResult('CORS Test', 'testing', 'Testing CORS configuration...');

    try {
      const response = await axios.options(`${API_URL}/api/auth/login`, { timeout: 5000 });
      addResult('CORS Test', 'success', 'CORS preflight successful', {
        headers: response.headers
      });
    } catch (error) {
      addResult('CORS Test', 'error', 'CORS configuration issue', {
        message: error.message,
        status: error.response?.status
      });
    }
    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="api-debugger">
      <div className="debugger-header">
        <h3>🔧 API Debugger</h3>
        <button onClick={clearResults} className="clear-btn">Clear</button>
      </div>
      
      <div className="debugger-info">
        <div><strong>API URL:</strong> {API_URL}</div>
        <div><strong>Environment:</strong> {import.meta.env.MODE}</div>
      </div>
      
      <div className="debugger-actions">
        <button onClick={testApiConnection} disabled={isLoading} className="debug-btn">
          🌐 Test API
        </button>
        <button onClick={testAuthEndpoint} disabled={isLoading} className="debug-btn">
          🔐 Test Auth
        </button>
        <button onClick={testCors} disabled={isLoading} className="debug-btn">
          🔄 Test CORS
        </button>
        
        <button onClick={testRegistration} disabled={isLoading} className="debug-btn">
          📝 Test Register
        </button>
      </div>
      
      {testResults.length > 0 && (
        <div className="debugger-results">
          <h4>📋 Test Results</h4>
          {testResults.map((result, index) => (
            <div key={index} className={`result-item ${result.status}`}>
              <div className="result-header">
                <span className="result-test">{result.test}</span>
                <span className="result-time">{result.timestamp}</span>
              </div>
              <div className="result-message">{result.message}</div>
              {result.details && (
                <details className="result-details">
                  <summary>Details</summary>
                  <pre>{JSON.stringify(result.details, null, 2)}</pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApiDebugger;
