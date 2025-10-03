import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import Register from './Register';

const AuthWrapper = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { loading } = useAuth();

  const switchToRegister = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Todo Master</h2>
            <p className="auth-subtitle">Loading...</p>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: '1rem', color: 'var(--gray-600)' }}>
              Checking authentication...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLogin ? (
        <Login onSwitchToRegister={switchToRegister} />
      ) : (
        <Register onSwitchToLogin={switchToLogin} />
      )}
    </>
  );
};

export default AuthWrapper;
