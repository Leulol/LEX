import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import TaskFilters from "./components/TaskFilters.jsx";
import TaskList from "./components/TaskList.jsx";
import TaskStats from "./components/TaskStats.jsx";
import {
  fetch_createTask,
  fetch_deleteAllTasks,
  fetch_deleteCompletedTasks,
  fetch_deleteTask,
  fetch_updateTask,
  fetchTasks,
} from "./services/taskApi.js";


function normalizeApiTask(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = typeof raw.id === "number" ? raw.id : Number.parseInt(raw.id, 10);
  if (!Number.isFinite(id)) return null;

  return {
    ...raw,
    id,
    title: typeof raw.title === "string" ? raw.title : "",
    completed: Boolean(raw.completed),
  };
}

function normalizeApiTasks(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeApiTask).filter(Boolean);
}

export default function App() {
  const inputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | done

  const [tasks, setTasks] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Load from backend on first render
  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await fetchTasks();

        setTasks(normalizeApiTasks(data?.data?.tasks));
      }catch(error) {
        console.error("Failed to Load Task: ", error);
      }finally{
        setHasLoaded(true)
      }
    }
    loadTasks();
  }, []);

  // Save to localStorage after load is complete
  useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks, hasLoaded]);

  // Add task
  async function createTask() {
  const nextTitle = title.trim();
  if (nextTitle === "") return;

  try {
    const data = await fetch_createTask(`${nextTitle}`)

    if (data.success === false) {
      console.error(data.error);
      return;
    }

    // backend returns created task
    const newTask = normalizeApiTask(data?.data || data);
    if (!newTask) {
      console.error("Unexpected task payload from server:", data);
      return;
    }

    setTasks((prev) => [...prev, newTask]);

    setTitle("");
    inputRef.current?.focus();

  } catch (error) {
    console.error("Failed to add task:", error);
  }
  }

  // Delete task
  async function deleteTask(id) {
    if (!Number.isFinite(id)) {
      console.error("Can't delete task without a valid numeric id:", id);
      return;
    }
    try{
      const data = await fetch_deleteTask(id);

      if (data.success === false) {
        console.error(data.error);
        return;
      }
      setTasks((prev)=> prev.filter((t) => t.id !== id));
    }catch(error){
      console.error("Failed to Load Task: ", error)
    }
  }



  async function deleteAllTasks() {
    if (tasks.length === 0) return;
    const ok = confirm("Delete all Tasks?")
    if (!ok) return;
    try{
      const data = await fetch_deleteAllTasks();
      if (data.success === false){
        console.error(data.error);
        return;
      }
      setTasks([]);
    }catch(error){
      console.error("Failed to delete all tasks: ", error);
    }
  }
  async function deleteCompletedTasks() {
    const completed = tasks.filter((t) => t.completed).length
    if (completed === 0) return;
    const ok = confirm(`Delete ${completed} completed task(s)?`);
    if (!ok) return;

    try{
      const data = await fetch_deleteCompletedTasks();
      if (data.success === false){
        console.error(data.error);
        return;
      }
      setTasks((prev) => prev.filter((t) => !t.completed));
    }catch(error){
      console.error("Failed to Delete Competed Task: ", error);
    }
  }

  function startEditing(task) {
    if (!task || !Number.isFinite(task.id)) {
      console.error("Can't edit task without a valid numeric id:", task);
      return;
    }
    setEditingId(task.id);
    setEditingTitle(task.title);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingTitle("");
  }

  async function commitEditing(id) {
    if (!Number.isFinite(id)) {
      console.error("Can't update task without a valid numeric id:", id);
      return;
    }
    const next = editingTitle.trim();
    if (next === "") return; // don't allow empty titles
    try{
      const data = await fetch_updateTask(id, { title: next });
      if (data?.success === false){
        console.error(data.error);
        return;
      }
      if (Array.isArray(data?.detail)) {
        console.error("Update failed (validation):", data.detail);
        return;
      }
      const updatedTask = normalizeApiTask(data?.data || data);
      if (!updatedTask) {
        console.error("Unexpected updated task payload from server:", data);
        return;
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? updatedTask : t))
      );
      cancelEditing();
    }catch(error){
      console.error("Failed to update task:", error);
    }
  }

  // Toggle completed state (persist to backend)
  async function toggle(id) {
    if (!Number.isFinite(id)) {
      console.error("Can't toggle task without a valid numeric id:", id);
      return;
    }
    const current = tasks.find((t) => t.id === id);
    if (!current) return;

    try {
      const data = await fetch_updateTask(id, { completed: !current.completed });
      if (data?.success === false) {
        console.error(data.error);
        return;
      }
      if (Array.isArray(data?.detail)) {
        console.error("Toggle failed (validation):", data.detail);
        return;
      }
      const updatedTask = normalizeApiTask(data?.data || data);
      if (!updatedTask) {
        console.error("Unexpected toggled task payload from server:", data);
        return;
      }
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  }

  const remainingCount = useMemo(
    () => tasks.reduce((n, t) => n + (t.completed ? 0 : 1), 0),//Reduce: If the function is true it will get it out 
    [tasks]
  );
  const completedCount = (tasks?.length || 0) - remainingCount;

  const visibleTasks = useMemo(() => {
    const q = query.trim().toLowerCase();

    return tasks
      .filter((t) => {
        if (filter === "active") return !t.completed;
        if (filter === "done") return t.completed;
        return true;
      })
      .filter((t) => (q === "" ? true : t.title.toLowerCase().includes(q)));
  }, [tasks, filter, query]);

  return (
    <div className="tm-shell">
      <main className="tm-card">
        <header className="tm-header">
          <div className="tm-titleRow">
            <div className="tm-titleBlock">
              <h1 className="tm-title">Tasks</h1>
              <TaskStats
                totalCount={tasks.length}
                remainingCount={remainingCount}
                completedCount={completedCount}
              />
            </div>

            <div className="tm-toolbar" aria-label="Task controls">
              <TaskFilters filter={filter} onChangeFilter={setFilter} />

              <button
                className="tm-btn tm-btnDanger"
                onClick={deleteCompletedTasks}
                type="button"
                title="Delete completed tasks"
                disabled={completedCount === 0}
              >
                Clear Done
              </button>
              <button
                className="tm-btn tm-btnDanger"
                onClick={deleteAllTasks}
                type="button"
                title="Delete all tasks"
                disabled={tasks.length === 0}
              >
                Clear All
              </button>
            </div>
          </div>
        </header>

        <div className="tm-topInputs">
          <div className="tm-inputRow">
            <input
              className="tm-input"
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a task..."
              aria-label="New task title"
              onKeyDown={(e) => {
                if (e.key === "Enter") createTask();
              }}
            />
            <button className="tm-btn tm-btnPrimary" onClick={createTask} type="button">
              Add
            </button>
          </div>

          <input
            className="tm-input tm-inputSearch"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks..."
            aria-label="Search tasks"
          />
        </div>

        <TaskList
          tasks={visibleTasks}
          editingId={editingId}
          editingTitle={editingTitle}
          onToggle={toggle}
          onDelete={deleteTask}
          onStartEdit={startEditing}
          onCommitEdit={commitEditing}
          onCancelEdit={cancelEditing}
          onEditingTitleChange={setEditingTitle}
        />

        {visibleTasks.length === 0 ? (
          <div className="tm-empty">
            {tasks.length === 0 ? "No tasks yet." : "No tasks match your search/filter."}
          </div>
        ) : null}
      </main>
    </div>
  );
}
