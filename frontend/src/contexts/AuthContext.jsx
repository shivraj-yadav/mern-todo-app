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

  // Create axios instance with auth header (optimized timeout)
  const authAPI = axios.create({
    baseURL: `${API_URL}/api/auth`,
    timeout: IS_PRODUCTION ? 30000 : 8000, // 30s for production, 8s for dev (faster)
  });

  // Add response interceptor for better error handling
  authAPI.interceptors.response.use(
    (response) => response,
    (error) => {
      // Don't log in production to keep console clean
      if (import.meta.env.DEV) {
        console.error('Auth API Error:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          code: error.response?.data?.code
        });
      }
      
      // Always throw the original error so components can handle it
      throw error;
    }
  );

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
          if (import.meta.env.DEV) {
            console.log('✅ User authenticated:', response.data.user.name);
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('❌ Auth check failed:', error.response?.status);
          }
          // Token is invalid, remove it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } else {
        if (import.meta.env.DEV) {
          console.log('🔓 No token found, user not authenticated');
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
      // Handle specific registration error cases
      let errorMessage = 'Registration failed. Please try again.';
      let errorCode = null;
      
      if (import.meta.env.DEV) {
        console.error('❌ Registration failed:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          code: error.response?.data?.code,
          url: error.config?.url
        });
      }
      
      if (error.response?.data?.message) {
        // Use the exact message from backend
        errorMessage = error.response.data.message;
        errorCode = error.response.data.code;
      } else if (error.response?.status) {
        // Fallback messages based on status code
        switch (error.response.status) {
          case 400:
            errorMessage = 'Invalid registration data. Please check your details.';
            break;
          case 409:
          case 11000: // MongoDB duplicate key error
            errorMessage = 'User already exists. Please login instead.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = 'Registration failed. Please try again.';
        }
      } else if (error.message === 'Network Error') {
        errorMessage = 'Server unreachable. Try again later.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Server may be starting up.';
      } else {
        errorMessage = 'Registration failed. Please try again.';
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
      
      if (import.meta.env.DEV) {
        console.log('✅ Login successful:', newUser.name);
      }
      
      return { 
        success: true, 
        message: 'Login successful! Welcome back!',
        data: response.data 
      };
    } catch (error) {
      // Handle specific login error cases
      let errorMessage = 'Invalid email or password. Please try again.';
      let errorCode = null;
      
      if (import.meta.env.DEV) {
        console.error('❌ Login failed:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          code: error.response?.data?.code,
          url: error.config?.url
        });
      }
      
      if (error.response?.data?.message) {
        // Use the exact message from backend
        errorMessage = error.response.data.message;
        errorCode = error.response.data.code;
      } else if (error.response?.status) {
        // Fallback messages based on status code
        switch (error.response.status) {
          case 400:
            errorMessage = 'Invalid input. Please check your details.';
            break;
          case 401:
            errorMessage = 'Invalid email or password.';
            break;
          case 404:
            errorMessage = 'User does not exist. Please register first.';
            break;
          case 409:
            errorMessage = 'User already exists. Please login instead.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = 'Something went wrong. Please try again.';
        }
      } else if (error.message === 'Network Error') {
        errorMessage = 'Server unreachable. Try again later.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Server may be starting up.';
      } else {
        errorMessage = 'Connection failed. Please try again.';
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
    const hasValidToken = !!token && token !== 'null' && token !== 'undefined';
    const hasValidUser = !!user && user !== null;
    
    if (import.meta.env.DEV) {
      console.log('🔐 Auth Check:', {
        hasValidToken,
        hasValidUser,
        token: token ? `${token.substring(0, 10)}...` : 'null',
        user: user ? user.name : 'null'
      });
    }
    
    return hasValidToken && hasValidUser;
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
