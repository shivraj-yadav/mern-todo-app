import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthWrapper from "./components/AuthWrapper";
import Navigation from "./components/Navigation";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import PerformanceMonitor from "./components/PerformanceMonitor";
import DevTools from "./components/DevTools";
import { startKeepAlive, stopKeepAlive } from "./utils/keepAlive";
import "./index.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Optimized Todo Component with performance enhancements
function TodoApp() {
  const { user, token, getAuthHeader } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [keepAliveId, setKeepAliveId] = useState(null);

  // Start keep-alive on component mount
  useEffect(() => {
    const id = startKeepAlive();
    setKeepAliveId(id);
    
    return () => stopKeepAlive(id);
  }, []);

  // Parallel data fetching - fetch user and tasks simultaneously
  const initializeData = useCallback(async () => {
    if (!user || !token) return;

    try {
      setLoading(true);
      setError(null);

      // Make parallel API calls instead of sequential
      const [tasksResponse] = await Promise.all([
        axios.get(`${API_URL}/api/tasks`, {
          headers: getAuthHeader(),
          timeout: 10000
        })
      ]);

      const tasksData = tasksResponse.data.tasks || tasksResponse.data;
      setTasks(Array.isArray(tasksData) ? tasksData : []);

    } catch (err) {
      if (err.response?.status !== 401) {
        setError(err.message || 'Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  }, [user, token, getAuthHeader]);

  // Initialize data when user is available
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Memoized filtered tasks to prevent unnecessary recalculations
  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'completed':
        return tasks.filter(task => task.completed);
      case 'pending':
        return tasks.filter(task => !task.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  // Memoized task statistics
  const taskStats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(task => task.completed).length,
    pending: tasks.filter(task => !task.completed).length
  }), [tasks]);

  // Optimized task operations with error handling
  const addTask = useCallback(async (title) => {
    try {
      const response = await axios.post(`${API_URL}/api/tasks`, 
        { title }, 
        { headers: getAuthHeader() }
      );
      const newTask = response.data.task || response.data;
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [getAuthHeader]);

  const updateTask = useCallback(async (id, updatedData) => {
    try {
      const response = await axios.put(`${API_URL}/api/tasks/${id}`, 
        updatedData, 
        { headers: getAuthHeader() }
      );
      const updatedTask = response.data.task || response.data;
      setTasks(prev => prev.map(task => task._id === id ? updatedTask : task));
      return updatedTask;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [getAuthHeader]);

  const deleteTask = useCallback(async (id) => {
    try {
      await axios.delete(`${API_URL}/api/tasks/${id}`, {
        headers: getAuthHeader()
      });
      setTasks(prev => prev.filter(task => task._id !== id));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [getAuthHeader]);

  // Optimized filter handler
  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  if (loading && tasks.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your workspace...</p>
        {!import.meta.env.DEV && (
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
            Server may be starting up, this could take 30-60 seconds...
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <PerformanceMonitor show={import.meta.env.DEV} />
      <Navigation />
      <div className="app">
        <div className="app-container">
          <header className="app-header">
            <h1 className="app-title">Welcome back, {user?.name}!</h1>
            <p className="app-subtitle">Your personal task manager</p>
          </header>

          <main className="app-content">
            {error && (
              <div className="error-banner">
                <span>⚠️ {error}</span>
                <button onClick={clearError}>×</button>
              </div>
            )}

            <TaskForm addTask={addTask} loading={loading} />

            {taskStats.total > 0 && (
              <div className="stats">
                <div className="stat-item">
                  <span>Total:</span>
                  <span className="stat-number">{taskStats.total}</span>
                </div>
                <div className="stat-item">
                  <span>Pending:</span>
                  <span className="stat-number">{taskStats.pending}</span>
                </div>
                <div className="stat-item">
                  <span>Completed:</span>
                  <span className="stat-number">{taskStats.completed}</span>
                </div>
              </div>
            )}

            <div className="filter-container">
              <button 
                className={`filter-button ${filter === "all" ? "active" : ""}`}
                onClick={() => handleFilterChange("all")}
              >
                All ({taskStats.total})
              </button>
              <button 
                className={`filter-button ${filter === "pending" ? "active" : ""}`}
                onClick={() => handleFilterChange("pending")}
              >
                Pending ({taskStats.pending})
              </button>
              <button 
                className={`filter-button ${filter === "completed" ? "active" : ""}`}
                onClick={() => handleFilterChange("completed")}
              >
                Completed ({taskStats.completed})
              </button>
            </div>

            <TaskList
              tasks={filteredTasks}
              updateTask={updateTask}
              deleteTask={deleteTask}
              loading={loading}
            />

            {!loading && taskStats.total > 0 && (
              <div className="completion-message">
                {taskStats.completed === taskStats.total ? (
                  <span>🎉 All tasks completed! Great job!</span>
                ) : (
                  <span>Keep going! {taskStats.pending} task{taskStats.pending !== 1 ? 's' : ''} remaining.</span>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
      <DevTools />
    </>
  );
}

// App Content Component with Authentication Check
function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Todo Master</h2>
            <p className="auth-subtitle">Loading...</p>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem', color: 'var(--gray-600)' }}>
              Checking authentication...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return isAuthenticated() ? <TodoApp /> : <AuthWrapper />;
}

// Main App Component with Performance Optimizations
function FastApp() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default FastApp;
