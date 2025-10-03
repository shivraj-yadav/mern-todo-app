import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthWrapper from "./components/AuthWrapper";
import Navigation from "./components/Navigation";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import "./index.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    if (error.response?.status === 404) {
      throw new Error('Resource not found.');
    }
    throw error;
  }
);

// Main Todo Component (authenticated users only)
function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, getAuthHeader } = useAuth();

  // Fetch tasks with error handling
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/tasks', {
        headers: getAuthHeader()
      });
      // Handle the new API response format
      const tasksData = response.data.tasks || response.data;
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (title) => {
    try {
      const response = await api.post('/tasks', { title }, {
        headers: getAuthHeader()
      });
      // Handle the new API response format
      const newTask = response.data.task || response.data;
      setTasks(prevTasks => [...prevTasks, newTask]);
      return newTask;
    } catch (err) {
      const errorMessage = err.message || 'Failed to add task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateTask = async (id, updatedData) => {
    try {
      const response = await api.put(`/tasks/${id}`, updatedData, {
        headers: getAuthHeader()
      });
      // Handle the new API response format
      const updatedTask = response.data.task || response.data;
      setTasks(prevTasks => 
        prevTasks.map((task) => (task._id === id ? updatedTask : task))
      );
      return updatedTask;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`, {
        headers: getAuthHeader()
      });
      setTasks(prevTasks => prevTasks.filter((task) => task._id !== id));
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const clearError = () => setError(null);

  return (
    <>
      <Navigation />
      <div className="app">
        <div className="app-container">
          <header className="app-header">
            <h1 className="app-title">Welcome back, {user?.name}!</h1>
            <p className="app-subtitle">Your personal task manager</p>
          </header>

        <main className="app-content">
          {error && (
            <div className="error-banner" style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: '#dc2626' }}>⚠️ {error}</span>
              <button 
                onClick={clearError}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
              >
                ×
              </button>
            </div>
          )}

          <TaskForm addTask={addTask} loading={loading} />

          {totalTasks > 0 && (
            <div className="stats">
              <div className="stat-item">
                <span>Total:</span>
                <span className="stat-number">{totalTasks}</span>
              </div>
              <div className="stat-item">
                <span>Pending:</span>
                <span className="stat-number">{pendingTasks}</span>
              </div>
              <div className="stat-item">
                <span>Completed:</span>
                <span className="stat-number">{completedTasks}</span>
              </div>
            </div>
          )}

          <div className="filter-container">
            <button 
              className={`filter-button ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({totalTasks})
            </button>
            <button 
              className={`filter-button ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pending ({pendingTasks})
            </button>
            <button 
              className={`filter-button ${filter === "completed" ? "active" : ""}`}
              onClick={() => setFilter("completed")}
            >
              Completed ({completedTasks})
            </button>
          </div>

          <TaskList
            tasks={filteredTasks}
            updateTask={updateTask}
            deleteTask={deleteTask}
            loading={loading}
          />

          {!loading && totalTasks > 0 && (
            <div style={{
              textAlign: 'center',
              marginTop: '2rem',
              padding: '1rem',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              {completedTasks === totalTasks ? (
                <span>🎉 All tasks completed! Great job!</span>
              ) : (
                <span>Keep going! {pendingTasks} task{pendingTasks !== 1 ? 's' : ''} remaining.</span>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
    </>
  );
}

// Main App Component with Authentication
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// App Content Component
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
            <div className="spinner" style={{ margin: '0 auto' }}></div>
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

export default App;
