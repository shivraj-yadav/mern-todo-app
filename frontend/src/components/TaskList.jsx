import React, { useState } from "react";

function TaskList({ tasks, updateTask, deleteTask, loading }) {
  const [updatingTasks, setUpdatingTasks] = useState(new Set());
  const [deletingTasks, setDeletingTasks] = useState(new Set());

  const handleToggleComplete = async (taskId, completed) => {
    if (updatingTasks.has(taskId)) return;
    
    setUpdatingTasks(prev => new Set(prev).add(taskId));
    try {
      await updateTask(taskId, { completed: !completed });
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setUpdatingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleDelete = async (taskId) => {
    if (deletingTasks.has(taskId)) return;
    
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    setDeletingTasks(prev => new Set(prev).add(taskId));
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setDeletingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading tasks...
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📝</div>
        <h3 className="empty-title">No tasks yet</h3>
        <p className="empty-description">
          Add your first task above to get started!
        </p>
      </div>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li 
          key={task._id} 
          className={`task-item ${task.completed ? 'completed' : ''}`}
        >
          <div 
            className={`task-checkbox ${task.completed ? 'completed' : ''}`}
            onClick={() => handleToggleComplete(task._id, task.completed)}
          >
            {task.completed && '✓'}
          </div>
          
          <div className={`task-content ${task.completed ? 'completed' : ''}`}>
            {task.title}
          </div>
          
          <div className="task-actions">
            <button
              className={`action-button ${task.completed ? 'undo-button' : 'complete-button'}`}
              onClick={() => handleToggleComplete(task._id, task.completed)}
              disabled={updatingTasks.has(task._id)}
            >
              {updatingTasks.has(task._id) ? (
                <div className="spinner" style={{ width: '12px', height: '12px' }}></div>
              ) : task.completed ? (
                <>↶ Undo</>
              ) : (
                <>✓ Complete</>
              )}
            </button>
            
            <button
              className="action-button delete-button"
              onClick={() => handleDelete(task._id)}
              disabled={deletingTasks.has(task._id)}
            >
              {deletingTasks.has(task._id) ? (
                <div className="spinner" style={{ width: '12px', height: '12px' }}></div>
              ) : (
                <>🗑️ Delete</>
              )}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default TaskList;
