import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Custom hook for parallel authentication and data loading
export const useParallelAuth = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Make both API calls in parallel instead of sequential
        const [authResponse, tasksResponse] = await Promise.all([
          axios.get(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000
          }),
          axios.get(`${API_URL}/api/tasks`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000
          }).catch(() => null) // Tasks call might fail if auth fails
        ]);

        if (authResponse.data) {
          setUser(authResponse.data.user);
          
          // Only set tasks if both calls succeeded
          if (tasksResponse?.data) {
            setTasks(tasksResponse.data.tasks || []);
          }
        }
      } catch (error) {
        console.error('App initialization error:', error);
        setError(error.message);
        // Clear invalid token
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  return { user, tasks, loading, error, setUser, setTasks };
};
