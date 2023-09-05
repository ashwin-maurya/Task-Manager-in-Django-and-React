import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Tasklist.css";

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/tasks/")
      .then((response) => {
        setTasks(response.data);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  }, []);

  const handleAddTask = () => {
    if (isEditMode) {
      axios
        .put(`http://127.0.0.1:8000/api/tasks/${editTaskId}/`, {
          title: newTask,
          description: newTaskDescription,
        })
        .then((response) => {
          const updatedTasks = tasks.map((task) => {
            if (task.id === editTaskId) {
              return response.data;
            }
            return task;
          });
          setTasks(updatedTasks);
          setIsEditMode(false);
          setEditTaskId(null);
          setSuccessMessage("Task updated successfully.");
        })
        .catch((error) => {
          console.error("Error updating task:", error);
          setErrorMessage("Error updating task.");
        });
    } else {
      axios
        .post("http://127.0.0.1:8000/api/tasks/", {
          title: newTask,
          description: newTaskDescription,
        })
        .then((response) => {
          setTasks([...tasks, response.data]);
          setSuccessMessage("Task added successfully.");
        })
        .catch((error) => {
          console.error("Error adding task:", error);
          setErrorMessage("Error adding task.");
        });
    }

    setNewTask("");
    setNewTaskDescription("");
    setTimeout(() => {
      setSuccessMessage(null);
      setErrorMessage(null);
    }, 1000);
  };

  const handleEditTask = (taskId) => {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    if (taskToEdit) {
      setIsEditMode(true);
      setEditTaskId(taskId);
      setNewTask(taskToEdit.title);
      setNewTaskDescription(taskToEdit.description);
    }
  };

  const handleToggleComplete = (taskId) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        task.completed = !task.completed;
        axios.patch(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
          completed: task.completed,
        });
      }
      return task;
    });

    setTasks(updatedTasks);
  };

  const handleDeleteTask = (taskId) => {
    axios
      .delete(`http://127.0.0.1:8000/api/tasks/${taskId}/`)
      .then(() => {
        const updatedTasks = tasks.filter((task) => task.id !== taskId);
        setTasks(updatedTasks);
        setSuccessMessage("Task deleted successfully.");
      })
      .catch((error) => {
        console.error("Error deleting task:", error);
        setErrorMessage("Error deleting task.");
      });
    setTimeout(() => {
      setSuccessMessage(null);
      setErrorMessage(null);
    }, 1000);
  };

  return (
    <div className="task-list">
      <h1>Task Manager</h1>
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <div className="form">
        <input
          type="text"
          placeholder="New Task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <textarea
          placeholder="Description"
          rows={5}
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
        />
        <button onClick={handleAddTask}>
          {isEditMode ? "Update Task" : "Add Task"}
        </button>
      </div>
      <h2>Your Tasks:</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="task-item">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggleComplete(task.id)}
            />
            <span
              style={{
                textDecoration: task.completed ? "line-through" : "none",
              }}
              title={task.description}
            >
              {task.title}
            </span>
            <button onClick={() => handleEditTask(task.id)}>Edit</button>
            <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
