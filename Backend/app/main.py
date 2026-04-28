# main.py
# FastAPI entry point
# Handles all HTTP requests and routes them to service.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from . import service

app = FastAPI()


# -------------------------
# Pydantic Schemas to validate incoming request data by storing and changing the JSON to pyhton data.
# -------------------------

class TaskCreate(BaseModel):
    title: str

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None


# -------------------------
# Routes from the specific URL and when a commands is sent(POST/GET) from that URL it will go through here
# -------------------------

@app.get("/tasks")
def get_tasks():
    tasks = service.get_all_tasks()
    return tasks


@app.get("/tasks/{task_id}")
def get_task(task_id: int):
    task = service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.post("/tasks")
def create_task(task: TaskCreate):#from the Pydantic Schemas in line 15-25
    from .models import Task
    new_task = Task(title=task.title)
    result = service.add_task(new_task)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create task")
    return result


@app.put("/tasks/{task_id}")
def update_task(task_id: int, task: TaskUpdate):
    updated_task = service.update_task(task_id, title=task.title, completed=task.completed)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found or invalid input")
    return updated_task


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    result = service.delete_task(task_id)
    if not result:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"detail": "Task deleted"}


@app.delete("/tasks")
def delete_all_tasks():
    result = service.delete_all_tasks()
    if not result:
        raise HTTPException(status_code=500, detail="Failed to delete all tasks")
    return {"detail": "All tasks deleted"}
