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
  if (import.meta.env.DEV) {
    console.log('🔗 API_URL:', API_URL);
    console.log('🔗 Auth API Base URL:', `${API_URL}/api/auth`);
    console.log('🔗 Environment:', import.meta.env.PROD ? 'Production' : 'Development');
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
    } else {
      delete authAPI.defaults.headers.common['Authorization'];
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
          if (import.meta.env.DEV) {
            console.error('Auth check failed:', error);
          }
          // Token is invalid, remove it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      // Always set loading to false after auth check
      setLoading(false);
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 10000); // 10 seconds max

    checkAuth().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => clearTimeout(timeoutId);
  }, [token]);

  // Register function with enhanced error handling
  const register = async (userData) => {
    try {
      setLoading(true);
      if (import.meta.env.DEV) {
        console.log('🚀 Starting registration request...');
        console.log('⏳ This may take 30-60 seconds if Render service is sleeping...');
      }
      
      const response = await authAPI.post('/register', userData);
      
      const { token: newToken, user: newUser } = response.data;
      
      // Store token and update state
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      return { 
        success: true, 
        message: 'Registration successful! Welcome to Todo Master!',
        data: response.data 
      };
    } catch (error) {
      // Only log in development
      if (import.meta.env.DEV) {
        console.error('Registration error:', error);
      }
      
      // Handle specific error cases with better messages
      let errorMessage = 'Registration failed. Please try again.';
      let errorCode = null;
      
      if (error.response?.data) {
        errorMessage = error.response.data.message || 'Registration failed. Please try again.';
        errorCode = error.response.data.code;
        
        // Log the full error for debugging (dev only)
        if (import.meta.env.DEV) {
          console.log('Registration error details:', {
            status: error.response.status,
            data: error.response.data,
            message: errorMessage,
            code: errorCode
          });
        }
      } else if (error.message === 'Network Error') {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. The server may be starting up, please try again in a moment.';
      } else {
        if (import.meta.env.DEV) {
          console.log('Unexpected registration error:', error);
        }
        errorMessage = 'Something went wrong. Please try again.';
      }
      
      return { 
        success: false, 
        error: errorMessage,
        code: errorCode
      };
    } finally {
      setLoading(false);
    }
  };

  // Login function with enhanced error handling
  const login = async (credentials) => {
    try {
      setLoading(true);
      if (import.meta.env.DEV) {
        console.log('🚀 Starting login request...');
      }
      
      const response = await authAPI.post('/login', credentials);
      
      const { token: newToken, user: newUser } = response.data;
      
      // Store token and update state
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      return { 
        success: true, 
        message: 'Login successful! Welcome back!',
        data: response.data 
      };
    } catch (error) {
      // Only log in development
      if (import.meta.env.DEV) {
        console.error('Login error:', error);
      }
      
      // Handle specific login error cases
      let errorMessage = 'Invalid email or password. Please try again.';
      let errorCode = null;
      
      if (error.response?.data) {
        errorMessage = error.response.data.message || 'Invalid email or password. Please try again.';
        errorCode = error.response.data.code;
        
        // Log the full error for debugging (dev only)
        if (import.meta.env.DEV) {
          console.log('Login error details:', {
            status: error.response.status,
            data: error.response.data,
            message: errorMessage,
            code: errorCode
          });
        }
        
        // Handle specific status codes
        if (error.response.status === 404) {
          errorMessage = 'User does not exist. Please register first.';
        } else if (error.response.status === 401) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.message === 'Network Error') {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. The server may be starting up, please try again in a moment.';
      } else {
        if (import.meta.env.DEV) {
          console.log('Unexpected login error:', error);
        }
        errorMessage = 'Something went wrong. Please try again.';
      }
      
      return { 
        success: false, 
        error: errorMessage,
        code: errorCode
      };
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
