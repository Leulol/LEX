//Here is where the diffrent method and service are provided for APP.jsx
//So we kind of use it in a way where it recives the arguments and fetchs the response and aslo deiplays it in a json file for the app.jsx
export const API_BASE_URL = "http://127.0.0.1:8000";

export async function fetchTasks(){
  const response = await fetch(`${API_BASE_URL}/tasks`);
  const data = await response.json();
  return data;
}

export async function fetch_createTask(nextTitle) {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
    body: JSON.stringify({ 
      title : nextTitle 
    }),
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
