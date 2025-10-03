import React, { useState, useEffect } from "react";
import axios from "axios";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/tasks`)
      .then((res) => setTasks(res.data));
  }, []);

  const addTask = async (title) => {
    const res = await axios.post(`${API_URL}/api/tasks`, { title });
    setTasks([...tasks, res.data]);
  };

  const updateTask = async (id, updatedData) => {
    const res = await axios.put(
      `${API_URL}/api/tasks/${id}`,
      updatedData
    );
    setTasks(tasks.map((task) => (task._id === id ? res.data : task)));
  };

  const deleteTask = async (id) => {
    await axios.delete(`${API_URL}/api/tasks/${id}`);
    setTasks(tasks.filter((task) => task._id !== id));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  return (
    <div className="App">
      <h1>Todo List App</h1>
      <TaskForm addTask={addTask} />

      <div>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
        <button onClick={() => setFilter("pending")}>Pending</button>
      </div>

      <TaskList
        tasks={filteredTasks}
        updateTask={updateTask}
        deleteTask={deleteTask}
      />
    </div>
  );
}

export default App;
