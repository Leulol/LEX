# main.py
# FastAPI entry point
# Handles all HTTP requests and routes them to service.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from . import service
from fastapi.middleware.cors import CORSMiddleware
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# Pydantic Schemas to validate incoming request data by storing and changing the JSON to python data.
# -------------------------

class TaskCreate(BaseModel):
    title: str
    priority: Optional[str] = "medium"
    subtasks: Optional[List[dict]] = None
    sort_order: Optional[int] = None
    order_mode: Optional[str] = "priority"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None
    subtasks: Optional[List[dict]] = None
    sort_order: Optional[int] = None
    order_mode: Optional[str] = None


class ReorderItem(BaseModel):
    id: int
    sort_order: int


class ReorderRequest(BaseModel):
    items: List[ReorderItem]

class AddJournalEntry(BaseModel):
    text: str
    ts: int

class PlannerItemCreate(BaseModel):
    title: str
    date: str

class PlannerItemUpdate(BaseModel):
    done: bool


# -------------------------
# Routes from the specific URL and when a commands is sent(POST/GET) from that URL it will go through here
# -------------------------

#---------------------------------------/tasks---------------------------------------------------
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
    new_task = Task(
        title=task.title,
        priority=task.priority,
        subtasks=task.subtasks,
        sort_order=task.sort_order,
        order_mode=task.order_mode,
    )
    result = service.add_task(new_task)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create task")
    return result


@app.patch("/tasks/{task_id}")
def update_task(task_id: int, task: TaskUpdate):
    updated_task = service.update_task(
        task_id,
        title=task.title,
        completed=task.completed,
        priority=task.priority,
        subtasks=task.subtasks,
        sort_order=task.sort_order,
        order_mode=task.order_mode,
    )
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found or invalid input")
    return updated_task


@app.patch("/tasks/reorder")
def reorder_tasks(req: ReorderRequest):
    payload = [i.model_dump() for i in req.items]
    result = service.reorder_tasks(payload)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to reorder tasks")
    return result


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

@app.delete("/tasks/completed")
def delete_completed_tasks():
    result = service.delete_completed_tasks()
    if not result:
        raise HTTPException(status_code=500, detail="Failed to delete completed tasks")
    return {"detail": "All Completed Tasks Deleted"}


#-----------------------------------------Journal-------------------------------------------

@app.post("/journal")
def add_journal_entry(entry: AddJournalEntry):
    result = service.add_entry(entry.text, entry.ts)
    if not result["success"]:
        raise HTTPException(status_code=500, detail="Failed to add journal entry")
    return result

@app.get("/journal")
def get_journal_entries():
    result = service.fetch_entries()
    if not result["success"]:
        raise HTTPException(status_code=500, detail="Failed to fetch journal entries")
    return result

@app.delete("/journal/{entry_id}")
def delete_journal_entry(entry_id: int):
    result = service.delete_entry(entry_id)
    if not result["success"]:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return {"detail": "Journal entry deleted"}


#-----------------------------------------Planner-------------------------------------------

@app.post("/planner")
def add_planner_item(item: PlannerItemCreate):
    result = service.add_planner_item(item.title, item.date)
    if not result["success"]:
        raise HTTPException(status_code=500, detail="Failed to add planner item")
    return result

@app.get("/planner")
def get_planner_items():
    result = service.fetch_planner_items()
    if not result["success"]:
        raise HTTPException(status_code=500, detail="Failed to fetch planner items")
    return result

@app.patch("/planner/{item_id}")
def update_planner_item(item_id: int, item: PlannerItemUpdate):
    result = service.update_planner_item(item_id, item.done)
    if not result["success"]:
        raise HTTPException(status_code=404, detail="Planner item not found")
    return result

@app.delete("/planner/{item_id}")
def delete_planner_item(item_id: int):
    result = service.delete_planner_item(item_id)
    if not result["success"]:
        raise HTTPException(status_code=404, detail="Planner item not found")
    return {"detail": "Planner item deleted"}
