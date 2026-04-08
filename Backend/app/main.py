from fastapi import FastAPI, HTTPException
from models import Task
from pydantic import BaseModel

app = FastAPI()

@app.get("/tasks")
def get_tasks():
    task = Task().get_all_tasks()
    return task

@app.get("/tasks/{task_id}")#In the task_id, we are using path parameter to get the specific task by its id.
def get_task(task_id: int):
    task = Task().get_task(task_id)
    if not task:#If the task is not found, it raises a 404 HTTPException.
        raise HTTPException(status_code=404, detail="Task not found")
    return task

class TaskCreate(BaseModel):
    title: str

@app.post("/tasks")#Used to post a new task on the database.
def create_task(task: TaskCreate):
    new_task = Task(title=task.title).add_task()
    if not new_task:
        raise HTTPException(status_code=500, detail="Failed to create task")
    return new_task

class TaskUpdate(BaseModel):
    title: str | None = None
    completed: bool | None = None

@app.put("/tasks/{task_id}")
def update_task(task_id: int, task: TaskUpdate):
    updated_task = Task().update_task(task_id, title=task.title, completed=task.completed)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found or invalid input")
    return updated_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    result = Task().delete_task(task_id)
    if not result:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"detail": "Task deleted"}