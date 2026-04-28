import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeStoredTasks(raw) {
  if (!Array.isArray(raw)) return [];

  // Back-compat: older entries may have been { title, done } without id.
  return raw
    .filter((t) => t && typeof t === "object")
    .map((t) => ({
      id: typeof t.id === "string" ? t.id : makeId(),
      title: typeof t.title === "string" ? t.title : "",
      done: Boolean(t.done),
      createdAt: typeof t.createdAt === "number" ? t.createdAt : Date.now(),
    }))
    .filter((t) => t.title.trim() !== "");
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

  // Load from localStorage on first render
  useEffect(() => {
    let stored = [];
    try {
      stored = JSON.parse(localStorage.getItem("tasks"));
    } catch {
      stored = [];
    }

    setTasks(normalizeStoredTasks(stored));
    setHasLoaded(true);
  }, []);

  // Save to localStorage after load is complete
  useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks, hasLoaded]);

  // Add task
  function addTask() {
    const nextTitle = title.trim();
    if (nextTitle === "") return;

    const newTask = {
      id: makeId(),
      title: nextTitle,
      done: false,
      createdAt: Date.now(),
    };

    setTasks((prev) => [...prev, newTask]);
    setTitle("");
    inputRef.current?.focus();
  }

  // Delete task
  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));//Filter when the conditon is true it pass when the whole comndition is false it deletes it
  }

  function deleteAllTasks() {
    if (tasks.length === 0) return;
    const ok = confirm("Delete all tasks?");
    if (!ok) return;
    setTasks([]);
  }
  function deleteCompletedTasks() {
    const completed = tasks.reduce((n, t) => n + (t.done ? 1 : 0), 0);
    if (completed === 0) return;
    const ok = confirm(`Delete ${completed} completed task(s)?`);
    if (!ok) return;
    setTasks((prev) => prev.filter((t) => !t.done));
  }

  function startEditing(task) {
    setEditingId(task.id);
    setEditingTitle(task.title);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingTitle("");
  }

  function commitEditing(id) {
    const next = editingTitle.trim();
    if (next === "") return; // don't allow empty titles
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title: next } : t)));
    cancelEditing();
  }

  // Toggle done state
  function toggle(id) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  const remainingCount = useMemo(
    () => tasks.reduce((n, t) => n + (t.done ? 0 : 1), 0),//Reduce: If the function is true it will get it out 
    [tasks]
  );
  const completedCount = tasks.length - remainingCount;

  const visibleTasks = useMemo(() => {
    const q = query.trim().toLowerCase();

    return tasks
      .filter((t) => {
        if (filter === "active") return !t.done;
        if (filter === "done") return t.done;
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
              <div className="tm-pills" aria-label="Task stats">
                <span className="tm-pill">
                  Total <b>{tasks.length}</b>
                </span>
                <span className="tm-pill">
                  Remaining <b>{remainingCount}</b>
                </span>
                <span className="tm-pill">
                  Done <b>{completedCount}</b>
                </span>
              </div>
            </div>

            <div className="tm-toolbar" aria-label="Task controls">
              <div className="tm-seg" role="tablist" aria-label="Filter tasks">
                <button
                  className={filter === "all" ? "tm-segBtn tm-segBtnActive" : "tm-segBtn"}
                  onClick={() => setFilter("all")}
                  type="button"
                  role="tab"
                  aria-selected={filter === "all"}
                >
                  All
                </button>
                <button
                  className={
                    filter === "active" ? "tm-segBtn tm-segBtnActive" : "tm-segBtn"
                  }
                  onClick={() => setFilter("active")}
                  type="button"
                  role="tab"
                  aria-selected={filter === "active"}
                >
                  Active
                </button>
                <button
                  className={filter === "done" ? "tm-segBtn tm-segBtnActive" : "tm-segBtn"}
                  onClick={() => setFilter("done")}
                  type="button"
                  role="tab"
                  aria-selected={filter === "done"}
                >
                  Done
                </button>
              </div>

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
                if (e.key === "Enter") addTask();
              }}
            />
            <button className="tm-btn tm-btnPrimary" onClick={addTask} type="button">
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

        <ul className="tm-list">
          {visibleTasks.map((item) => {
            const isEditing = editingId === item.id;

            return (
              <li className="tm-item" key={item.id}>
                <button
                  className="tm-btn tm-btnGhost tm-btnTight"
                  onClick={() => toggle(item.id)}
                  type="button"
                  aria-pressed={item.done}
                  title={item.done ? "Mark as not done" : "Mark as done"}
                >
                  {item.done ? "Undo" : "Done"}
                </button>

                {isEditing ? (
                  <input
                    className="tm-input tm-inputInline"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    aria-label="Edit task title"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEditing(item.id);
                      if (e.key === "Escape") cancelEditing();
                    }}
                  />
                ) : (
                  <span className={item.done ? "tm-text tm-textDone" : "tm-text"}>
                    {item.title}
                  </span>
                )}

                {isEditing ? (
                  <button
                    className="tm-btn tm-btnPrimary tm-btnTight"
                    onClick={() => commitEditing(item.id)}
                    type="button"
                    title="Save edit"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="tm-btn tm-btnGhost tm-btnTight"
                    onClick={() => startEditing(item)}
                    type="button"
                    title={item.done ? "Completed tasks can't be edited" : "Edit task"}
                    disabled={item.done}
                  >
                    Edit
                  </button>
                )}

                <button
                  className="tm-btn tm-btnDanger tm-btnTight"
                  onClick={() => deleteTask(item.id)}
                  type="button"
                  title="Delete task"
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>

        {visibleTasks.length === 0 ? (
          <div className="tm-empty">
            {tasks.length === 0 ? "No tasks yet." : "No tasks match your search/filter."}
          </div>
        ) : null}
      </main>
    </div>
  );
}
