# service.py
# Handles all database operations for tasks.
# Imports Task blueprint from models.py and database connection from database.py

import sqlite3
from datetime import datetime
from Backend.app.config import Config
import database
from models import Task

def validate_title(title):
    if not title or title.strip() == "":
        raise ValueError("Title cannot be empty")
    title = title.strip()
    if len(title) > Config.MAX_TITLE_LENGTH:
        raise ValueError(f"Title cannot exceed {Config.MAX_TITLE_LENGTH} characters")   
    return title

def validate_id(task_id):
    if not isinstance(task_id, int) or task_id <= 0:
        raise ValueError("Invalid Taks ID")

def validate_completed(value):
    if not isinstance(value, bool):
        raise ValueError("Completeed must be a Boolean")
    return value

def add_task(task):#the task must be declared using Task() before being passed to this function.
    task.title = validate_title(task.title)
    task.completed = validate_completed(task.completed)

    try:
        database.cursor.execute(
            "INSERT INTO tasks (title, completed) VALUES (?, ?)",
            (task.title, int(task.completed))
        )
        database.conn.commit()
        task.id = database.cursor.lastrowid
        database.cursor.execute(#Fetch the newly added task
            "SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = ?",
            (task.id,))
        row = database.cursor.fetchone()
        if not row:
            print(f"Error occurred while fetching newly added task with id {task.id}")
            return None
        return Task(
            id=row[0],
            title=row[1],
            completed=bool(row[2]),
            created_at=row[3],
            updated_at=row[4]
        )

    except sqlite3.Error as e:
        print(f"Error occurred while adding task: {e}")
        return None



def get_task(id):
    validate_id(id)
    try:
        database.cursor.execute(
            "SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = ?",
            (id,)
        )
        row = database.cursor.fetchone()

    except sqlite3.Error as e:
        print(f"Error occurred while fetching task: {e}")
        return None

    if row:
        return Task(id=row[0], title=row[1], completed=bool(row[2]), created_at=row[3], updated_at=row[4])
    return None


def get_all_tasks():
    try:
        database.cursor.execute("SELECT id, title, completed, created_at, updated_at FROM tasks")
        rows = database.cursor.fetchall()

    except sqlite3.Error as e:
        print(f"Error occurred while fetching all tasks: {e}")
        return []

    return [Task(id=row[0], title=row[1], completed=bool(row[2]), created_at=row[3], updated_at=row[4]) for row in rows]


def update_task(id, title=None, completed=None):
    validate_id(id)
    # Step 1: Fetch current task
    task = get_task(id)
    if not task:
        print(f"Task {id} not found")
        return None
    if title is not None:
        title = validate_title(title)
    if completed is not None:
        completed = validate_completed(completed)

    new_title = title if title is not None else task.title
    new_completed = completed if completed is not None else task.title

    # Step 3: Update in database
    try:
        database.cursor.execute(
            "UPDATE tasks SET title = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (new_title, int(new_completed), id)
        )
        database.conn.commit()

    except sqlite3.Error as e:
        print(f"Error occurred while updating task: {e}")
        return None

    # Step 4: Return updated task
    return get_task(id)


def delete_task(id):
    validate_id(id)
    try:
        database.cursor.execute(
            "DELETE FROM tasks WHERE id = ?",
            (id,)
        )
        database.conn.commit()

    except sqlite3.Error as e:
        print(f"Error occurred while deleting task: {e}")
        return False

    return database.cursor.rowcount > 0


def delete_all_tasks():
    try:
        database.cursor.execute("DELETE FROM tasks")
        database.conn.commit()

    except sqlite3.Error as e:
        print(f"Error occurred while deleting all tasks: {e}")
        return False

    return True