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

async function fetchJson(url, options = {}) {
  const fullUrl = `${API_BASE_URL}${url}`;

  let response;
  try {
    response = await fetch(fullUrl, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options, // If the fetch function is to display some data like a POST
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Network error calling ${fullUrl}: ${message}`);
  }

  if (!response.ok) {
    let detail = "";
    try {
      detail = await response.text();
    } catch {
      // ignore
    }
    const suffix = detail ? ` - ${detail}` : "";
    throw new Error(`API error ${response.status} ${response.statusText} for ${fullUrl}${suffix}`);
  }

  // Some endpoints may respond with 204 No Content.
  if (response.status === 204) return null;
  return response.json();
}

export const taskApi = {
  getTasks: () => fetchJson('/tasks'),
  getTask: (id) => fetchJson(`/tasks/${id}`),
  createTask: (data) => fetchJson('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => fetchJson(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id) => fetchJson(`/tasks/${id}`, { method: 'DELETE' }),
  deleteTasks: () => fetchJson('/tasks', {method: 'DELETE'}),
  deleteCompletedTasks: () => fetchJson('/tasks/completed', {method: 'DELETE'}),
  reorderTasks: (items) => fetchJson('/tasks/reorder', {method: 'PATCH', body : JSON.stringify({items})})
}




//___________________________________________Planner________________________________________
