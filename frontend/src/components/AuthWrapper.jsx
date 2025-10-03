import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import Register from './Register';
import LoadingSpinner from './LoadingSpinner';

const AuthWrapper = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { loading } = useAuth();

  const switchToRegister = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  if (loading) {
    return <LoadingSpinner message="🔐 Checking authentication..." showProgress={true} />;
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
