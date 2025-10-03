import React from "react";

function TaskList({ tasks, updateTask, deleteTask }) {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task._id}>
          <span
            style={{ textDecoration: task.completed ? "line-through" : "none" }}
          >
            {task.title}
          </span>
          <button
            onClick={() => updateTask(task._id, { completed: !task.completed })}
          >
            {task.completed ? "Undo" : "Complete"}
          </button>
          <button onClick={() => deleteTask(task._id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

export default TaskList;
