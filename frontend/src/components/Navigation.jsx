import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (!confirmed) return;

    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="nav-header">
      <div className="nav-brand">
        📝 Todo Master
      </div>
      
      <div className="nav-user">
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className="user-email">{user?.email}</span>
        </div>
        
        <button
          onClick={handleLogout}
          className="logout-button"
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <div className="spinner" style={{ width: '12px', height: '12px' }}></div>
              Logging out...
            </>
          ) : (
            <>
              🚪 Logout
            </>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
