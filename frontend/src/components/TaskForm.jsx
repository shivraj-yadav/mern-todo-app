import React, { useState } from "react";

function TaskForm({ addTask, loading }) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await addTask(title.trim());
      setTitle("");
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="task-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            className="task-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What needs to be done?"
            disabled={isSubmitting || loading}
            maxLength={200}
            autoFocus
          />
        </div>
        <button 
          type="submit" 
          className="add-button"
          disabled={!title.trim() || isSubmitting || loading}
        >
          {isSubmitting ? (
            <>
              <div className="spinner"></div>
              Adding...
            </>
          ) : (
            <>
              <span>➕</span>
              Add Task
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default TaskForm;
