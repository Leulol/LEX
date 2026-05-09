// Here is where the different methods and service are provided for App.jsx.
// Make API URL automatic so you don't edit this file every time the IPv4 changes.
//
// Priority:
// 1) Use `VITE_API_BASE_URL` if set (e.g. "http://192.168.1.10:8000")
// 2) Otherwise use the same hostname as the frontend, but port 8000.
export const API_BASE_URL = (() => {
  const fromEnv = import.meta?.env?.VITE_API_BASE_URL;
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") return fromEnv.trim();

  // Fallback for tooling/non-browser contexts
  if (typeof window === "undefined") return "http://127.0.0.1:8000";

  const protocol = window.location.protocol || "http:";
  const host = window.location.hostname || "127.0.0.1";
  return `${protocol}//${host}:8000`;
})();

export async function fetchTasks() {
  const response = await fetch(`${API_BASE_URL}/tasks`);
  const data = await response.json();
  return data;
}

export async function fetch_createTask(task) {
  const payload =
    typeof task === "string"
      ? { title: task }
      : {
          title: task?.title,
          priority: task?.priority,
          subtasks: task?.subtasks,
        };

  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  return data;
}

export async function fetch_deleteTask(id) {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  return data;
}

export async function fetch_deleteAllTasks() {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "DELETE",
  });
  const data = await response.json();
  return data;
}

export async function fetch_deleteCompletedTasks() {
  const response = await fetch(`${API_BASE_URL}/tasks/completed`, {
    method: "DELETE",
  });
  const data = await response.json();
  return data;
}

export async function fetch_updateTask(taskId, updates) {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  return data;
}

