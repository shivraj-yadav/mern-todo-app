import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import AuthWrapper from "./AuthWrapper";
import Navigation from "./Navigation";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import { startKeepAlive, stopKeepAlive } from "../utils/keepAlive";
import { useParallelAuth } from "../hooks/useParallelAuth";
import "./index.css";

// Optimized main app component
function OptimizedApp() {
  const { user, tasks, loading } = useParallelAuth();
  const [filter, setFilter] = useState('all');
  const [keepAliveId, setKeepAliveId] = useState(null);

  // Start keep-alive on app mount
  useEffect(() => {
    const id = startKeepAlive();
    setKeepAliveId(id);
    
    return () => stopKeepAlive(id);
  }, []);

  // Memoized filtered tasks to prevent unnecessary recalculations
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
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
  const taskStats = useMemo(() => {
    if (!tasks) return { total: 0, completed: 0, pending: 0 };
    
    return {
      total: tasks.length,
      completed: tasks.filter(task => task.completed).length,
      pending: tasks.filter(task => !task.completed).length
    };
  }, [tasks]);

  // Optimized filter handler with useCallback
  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your workspace...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthWrapper />;
  }

  return (
    <AuthProvider>
      <Navigation />
      <div className="app">
        <div className="app-container">
          <header className="app-header">
            <h1 className="app-title">Welcome back, {user.name}!</h1>
            <p className="app-subtitle">Your personal task manager</p>
          </header>

          <main className="app-main">
            <div className="task-section">
              <TaskForm />
              
              {/* Task Statistics */}
              <div className="task-stats">
                <span>Total: {taskStats.total}</span>
                <span>Pending: {taskStats.pending}</span>
                <span>Completed: {taskStats.completed}</span>
              </div>

              {/* Filter Controls */}
              <div className="filter-controls">
                <button 
                  className={filter === 'all' ? 'active' : ''}
                  onClick={() => handleFilterChange('all')}
                >
                  All Tasks
                </button>
                <button 
                  className={filter === 'pending' ? 'active' : ''}
                  onClick={() => handleFilterChange('pending')}
                >
                  Pending
                </button>
                <button 
                  className={filter === 'completed' ? 'active' : ''}
                  onClick={() => handleFilterChange('completed')}
                >
                  Completed
                </button>
              </div>

              <TaskList tasks={filteredTasks} />
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}

export default OptimizedApp;
