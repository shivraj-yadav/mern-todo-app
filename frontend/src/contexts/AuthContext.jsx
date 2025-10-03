import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const IS_PRODUCTION = import.meta.env.PROD;
  
  // Debug logging (only in development)
  if (!IS_PRODUCTION) {
    console.log('🔗 API_URL:', API_URL);
    console.log('🔗 Auth API Base URL:', `${API_URL}/api/auth`);
    console.log('🔗 Environment:', IS_PRODUCTION ? 'Production' : 'Development');
  }

  // Create axios instance with auth header (increased timeout for Render cold starts)
  const authAPI = axios.create({
    baseURL: `${API_URL}/api/auth`,
    timeout: 30000, // 30 seconds for Render free tier cold starts
  });

  // Add token to requests if available
  useEffect(() => {
    if (token) {
      authAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete authAPI.defaults.headers.common['Authorization'];
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await authAPI.get('/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          // Token is invalid, remove it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('🚀 Starting registration request...');
      console.log('⏳ This may take 30-60 seconds if Render service is sleeping...');
      const response = await authAPI.post('/register', userData);
      
      const { token: newToken, user: newUser } = response.data;
      
      // Store token and update state
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.post('/login', credentials);
      
      const { token: newToken, user: newUser } = response.data;
      
      // Store token and update state
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint (optional)
      if (token) {
        await authAPI.post('/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      
      // Clear axios default headers
      delete authAPI.defaults.headers.common['Authorization'];
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Update user profile
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!token;
  };

  // Get auth header for API calls
  const getAuthHeader = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    updateUser,
    isAuthenticated,
    getAuthHeader
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
