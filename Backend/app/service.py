# service.py
# Handles all database operations for tasks.
# Imports Task blueprint from models.py and database connection from database.py

import sqlite3
from datetime import datetime
import database
from models import Task


def add_task(task):#the task must be declared using Task() before being passed to this function.
    # Validation
    if not task.title or task.title.strip() == "":
        raise ValueError("Title cannot be empty")

    task.title = task.title.strip()
    now = datetime.now().isoformat()
    created_at = now
    updated_at = now

    try:
        database.cursor.execute(
            "INSERT INTO tasks (title, completed, created_at, updated_at) VALUES (?, ?, ?, ?)",
            (task.title, int(task.completed), created_at, updated_at)
        )
        database.conn.commit()
        task.id = database.cursor.lastrowid

    except sqlite3.Error as e:
        print(f"Error occurred while adding task: {e}")
        return None

    return task


def get_task(id):
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
    # Step 1: Fetch current task
    task = get_task(id)
    if not task:
        print(f"Task {id} not found")
        return None

    # Step 2: Prepare new values
    if title is not None and title.strip() == "":
        print("Title cannot be empty")
        return None

    new_title = title.strip() if title is not None and title.strip() != "" else task.title
    new_completed = bool(completed) if completed is not None else task.completed
    now = datetime.now().isoformat()

    # Step 3: Update in database
    try:
        database.cursor.execute(
            "UPDATE tasks SET title = ?, completed = ?, updated_at = ? WHERE id = ?",
            (new_title, int(new_completed), now, id)
        )
        database.conn.commit()

    except sqlite3.Error as e:
        print(f"Error occurred while updating task: {e}")
        return None

    # Step 4: Return updated task
    return get_task(id)


def delete_task(id):
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