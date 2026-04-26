import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [task, setTask] = useState({ title: "", done: false });
  const [tasks, setTasks] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load from localStorage on first render
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(storedTasks);
    setHasLoaded(true);
  }, []);

  // Save to localStorage after load is complete
  useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks, hasLoaded]);

  // Add task
  function addTask() {
    if (task.title.trim() === "") return;

    setTasks([...tasks, task]);
    setTask({ title: "", done: false });
  }

  // Delete task
  function deleteTask(index) {
    setTasks(tasks.filter((_, i) => i !== index));
  }

  // Toggle done state
  function toggle(index) {
    const updated = tasks.map((t, i) =>
      i === index ? { ...t, done: !t.done } : t
    );
    setTasks(updated);
  }

  const remainingCount = tasks.reduce((n, t) => n + (t.done ? 0 : 1), 0);

  return (
    <div className="tm-shell">
      <main className="tm-card">
        <header className="tm-header">
          <div className="tm-titleRow">
            <h1 className="tm-title">Tasks</h1>
            <div className="tm-pills">
              <span className="tm-pill">
                Total <b>{tasks.length}</b>
              </span>
              <span className="tm-pill">
                Remaining <b>{remainingCount}</b>
              </span>
            </div>
          </div>
        </header>

        <div className="tm-inputRow">
          <input
            className="tm-input"
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            placeholder="Add a task..."
            aria-label="Task title"
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask();
            }}
          />
          <button className="tm-primaryBtn" onClick={addTask} type="button">
            Add
          </button>
        </div>

        <ul className="tm-list">
          {tasks.map((item, index) => (
            <li className="tm-item" key={index}>
              <button
                className="tm-toggleBtn"
                onClick={() => toggle(index)}
                type="button"
                aria-pressed={item.done}
                title={item.done ? "Mark as not done" : "Mark as done"}
              >
                {item.done ? "Undo" : "Done"}
              </button>

              <span className={item.done ? "tm-text tm-textDone" : "tm-text"}>
                {item.title}
              </span>

              <button
                className="tm-dangerBtn"
                onClick={() => deleteTask(index)}
                type="button"
                title="Delete task"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        {tasks.length === 0 ? (
          <div className="tm-empty">No tasks yet.</div>
        ) : null}
      </main>
    </div>
  );
}
