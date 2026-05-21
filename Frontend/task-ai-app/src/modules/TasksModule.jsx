import { useEffect, useMemo, useState } from "react";
import TaskFilters from "../components/TaskFilters.jsx";
import TaskList from "../components/TaskList.jsx";
import TaskStats from "../components/TaskStats.jsx";
import AddTaskWidget from "../components/AddTaskWidget.jsx";
import { API_BASE_URL, taskApi } from "../services/taskApi.js";


function normalizeApiTask(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = typeof raw.id === "number" ? raw.id : Number.parseInt(raw.id, 10);
  if (!Number.isFinite(id)) return null;

  const rawSortOrder = raw.sort_order;
  const sort_order =
    rawSortOrder === null || typeof rawSortOrder === "undefined"
      ? null
      : typeof rawSortOrder === "number"
        ? rawSortOrder
        : Number.parseInt(rawSortOrder, 10);

  return {
    ...raw,
    id,
    title: typeof raw.title === "string" ? raw.title : "",
    completed: Boolean(raw.completed),
    priority:
      raw.priority === "low" || raw.priority === "high" || raw.priority === "medium"
        ? raw.priority
        : "medium",
    subtasks: Array.isArray(raw.subtasks) ? raw.subtasks : [],
    sort_order: Number.isFinite(sort_order) ? sort_order : null,
    order_mode: raw.order_mode === "manual" || raw.order_mode === "priority" ? raw.order_mode : "priority",
  };
}

function normalizeApiTasks(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeApiTask).filter(Boolean);
}

export default function TasksModule({ inputRef }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium"); // low | medium | high
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | done

  const [tasks, setTasks] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingPriority, setEditingPriority] = useState("medium");
  const [editingSubtasks, setEditingSubtasks] = useState([]);

  const makeSubtaskCid = () =>
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  async function refreshTasks() {
    try {
      const data = await taskApi.getTasks();
      if (data.success) setTasks(normalizeApiTasks(data?.data?.tasks));
      setApiError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setApiError((prev) => (prev === message ? prev : message));
    }
  }

  useEffect(() => {
    async function loadTasks() {
      try {
        await refreshTasks();
      } catch (error) {
        console.error("Failed to Load Task: ", error);
      } finally {
        setHasLoaded(true);
      }
    }
    loadTasks();
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    let cancelled = false;

    async function tick() {
      if (cancelled) return;
      if (document.visibilityState !== "visible") return;
      if (apiError) return;
      await refreshTasks();
    }

    const id = setInterval(tick, 2500);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [hasLoaded, apiError]);

  useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks, hasLoaded]);

  async function createTask() {
    const nextTitle = title.trim();
    if (nextTitle === "") return false;

    try {
      const data = await taskApi.createTask({
        title: nextTitle,
        priority,
        subtasks: [],
      });

      if (data.success === false) {
        console.error(data.error);
        return false;
      }

      const newTask = normalizeApiTask(data?.data || data);
      if (!newTask) {
        console.error("Unexpected task payload from server:", data);
        return false;
      }

      setTasks((prev) => [...prev, newTask]);

      setTitle("");
      refreshTasks();
      return true;
    } catch (error) {
      console.error("Failed to add task:", error);
      return false;
    }
  }

  async function deleteTask(id) {
    if (!Number.isFinite(id)) {
      console.error("Can't delete task without a valid numeric id:", id);
      return;
    }
    try {
      const data = await taskApi.deleteTask(id);
      if (data.success === false) {
        console.error(data.error);
        return;
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
      refreshTasks();
    } catch (error) {
      console.error("Failed to delete task: ", error);
    }
  }

  async function deleteAllTasks() {
    if (tasks.length === 0) return;
    const ok = confirm("Delete all Tasks?");
    if (!ok) return;
    try {
      const data = await taskApi.deleteTasks();
      if (data.success === false) {
        console.error(data.error);
        return;
      }
      setTasks([]);
      refreshTasks();
    } catch (error) {
      console.error("Failed to delete all tasks: ", error);
    }
  }

  async function deleteCompletedTasks() {
    const completed = tasks.filter((t) => t.completed).length;
    if (completed === 0) return;
    const ok = confirm(`Delete ${completed} completed task(s)?`);
    if (!ok) return;

    try {
      const data = await taskApi.deleteCompletedTasks();
      if (data.success === false) {
        console.error(data.error);
        return;
      }
      setTasks((prev) => prev.filter((t) => !t.completed));
      refreshTasks();
    } catch (error) {
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
    setEditingPriority(task.priority ?? "medium");
    const raw = Array.isArray(task.subtasks) ? task.subtasks : [];
    setEditingSubtasks(
      raw.map((s) => ({
        _cid: s?._cid ?? makeSubtaskCid(),
        title: (s?.title ?? "").toString(),
        completed: Boolean(s?.completed),
      }))
    );
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingTitle("");
    setEditingPriority("medium");
    setEditingSubtasks([]);
  }

  async function commitEditing(id) {
    if (!Number.isFinite(id)) {
      console.error("Can't update task without a valid numeric id:", id);
      return;
    }
    const next = editingTitle.trim();
    if (next === "") return;

    try {
      const cleanedSubtasks = (Array.isArray(editingSubtasks) ? editingSubtasks : []).map((s) => ({
        title: (s?.title ?? "").toString(),
        completed: Boolean(s?.completed),
      }));

      const data = await taskApi.updateTask(id, {
        title: next,
        priority: editingPriority,
        subtasks: cleanedSubtasks,
      });
      if (data?.success === false) {
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

      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
      cancelEditing();
      refreshTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  }

  async function toggle(id) {
    if (!Number.isFinite(id)) {
      console.error("Can't toggle task without a valid numeric id:", id);
      return;
    }
    const current = tasks.find((t) => t.id === id);
    if (!current) return;
    const nextCompleted = !current.completed;

    try {
      const data = await taskApi.updateTask(id, { completed: nextCompleted });
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
      refreshTasks();
      if (nextCompleted) navigator.vibrate?.(50);
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  }

  const remainingCount = useMemo(
    () => tasks.reduce((n, t) => n + (t.completed ? 0 : 1), 0),
    [tasks]
  );
  const completedCount = (tasks?.length || 0) - remainingCount;

  const visibleTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    const priorityRank = (p) => (p === "high" ? 3 : p === "medium" ? 2 : 1);
    const hasManual = tasks.some((t) => t?.order_mode === "manual");

    const filtered = tasks
      .filter((t) => {
        if (filter === "active") return !t.completed;
        if (filter === "done") return t.completed;
        return true;
      })
      .filter((t) => (q === "" ? true : t.title.toLowerCase().includes(q)));

    const sorted = [...filtered].sort((a, b) => {
      if (hasManual) {
        const ao = Number.isFinite(a.sort_order) ? a.sort_order : Number.MAX_SAFE_INTEGER;
        const bo = Number.isFinite(b.sort_order) ? b.sort_order : Number.MAX_SAFE_INTEGER;
        if (ao !== bo) return ao - bo;
      }
      const ap = priorityRank(a.priority);
      const bp = priorityRank(b.priority);
      if (ap !== bp) return bp - ap;
      return (a.id ?? 0) - (b.id ?? 0);
    });

    return sorted;
  }, [tasks, filter, query]);

  async function reorderTasks(activeId, overId) {
    if (!Number.isFinite(activeId) || !Number.isFinite(overId)) return;
    if (activeId === overId) return;

    const currentVisible = Array.isArray(visibleTasks) ? visibleTasks : [];
    const visibleCopy = [...currentVisible];
    const fromIndex = visibleCopy.findIndex((t) => t.id === activeId);
    const toIndex = visibleCopy.findIndex((t) => t.id === overId);
    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = visibleCopy.splice(fromIndex, 1);
    visibleCopy.splice(toIndex, 0, moved);

    const visibleIds = new Set(visibleCopy.map((t) => t.id));
    const untouched = (Array.isArray(tasks) ? tasks : []).filter((t) => !visibleIds.has(t.id));

    const combined = [...visibleCopy, ...untouched];
    const next = combined.map((t, idx) => ({ ...t, order_mode: "manual", sort_order: idx }));
    setTasks(next);

    try {
      const items = next
        .map((t) => t.id)
        .filter((id) => Number.isFinite(id))
        .map((id, idx) => ({ id, sort_order: idx }));

      const data = await taskApi.reorderTasks(items);
      if (data?.success === false) {
        console.error(data.error);
        return;
      }
      refreshTasks();
    } catch (error) {
      console.error("Failed to reorder tasks:", error);
    }
  }

  return (
    <div className="tm-module" role="tabpanel" aria-label="Tasks">
      <div className="tm-moduleHeader">
        <h2 className="tm-moduleTitle">TO DO LIST</h2>
        <p className="tm-moduleSub">Tasks that must get done.</p>
      </div>

      {apiError ? (
        <div className="tm-empty" role="status">
          Backend unreachable at {API_BASE_URL}. {apiError}{" "}
          <button className="tm-btn tm-btnPrimary" type="button" onClick={refreshTasks}>
            Retry
          </button>
        </div>
      ) : null}

      <div className="tm-titleRow">
        <div className="tm-titleBlock">
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

      <div className="tm-topInputs">
        <AddTaskWidget
          title={title}
          priority={priority}
          onTitleChange={setTitle}
          onPriorityChange={setPriority}
          onCreate={createTask}
          inputRef={inputRef}
        />

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
        editingPriority={editingPriority}
        editingSubtasks={editingSubtasks}
        onReorder={reorderTasks}
        onToggle={toggle}
        onDelete={deleteTask}
        onStartEdit={startEditing}
        onCommitEdit={commitEditing}
        onCancelEdit={cancelEditing}
        onEditingTitleChange={setEditingTitle}
        onEditingPriorityChange={setEditingPriority}
        onEditingSubtasksChange={setEditingSubtasks}
      />

      {visibleTasks.length === 0 ? (
        <div className="tm-empty">
          {tasks.length === 0 ? "No tasks yet." : "No tasks match your search/filter."}
        </div>
      ) : null}
    </div>
  );
}
