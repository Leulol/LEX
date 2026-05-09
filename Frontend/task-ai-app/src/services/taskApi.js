//Here is where the diffrent method and service are provided for APP.jsx
//So we kind of use it in a way where it recives the arguments and fetchs the response and aslo deiplays it in a json file for the app.jsx
// Backend base URL (FastAPI). Default: local dev server.
const API_BASE_URL = "http://192.168.1.8:8000";

export async function fetchTasks(){
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
  const data = await response.json()
  return data;
}

export async function fetch_deleteTask(id) {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method:"DELETE",
  });
  const data = await response.json();
  return data;
}

export async function fetch_deleteAllTasks() {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "DELETE"
      })
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
