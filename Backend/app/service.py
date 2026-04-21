import sqlite3
from .config import Config
from . import database
from .models import Task
from .logger import logger


# ---------------- VALIDATION ---------------- #

def validate_title(title):
    if not title or title.strip() == "":
        raise ValueError("Title cannot be empty")

    title = title.strip()

    if len(title) > Config.MAX_TITLE_LENGTH:
        raise ValueError(f"Title cannot exceed {Config.MAX_TITLE_LENGTH} characters")

    return title


def validate_id(task_id):
    if not isinstance(task_id, int) or task_id <= 0:
        raise ValueError("Invalid Task ID")


def validate_completed(value):
    if not isinstance(value, bool):
        raise ValueError("Completed must be a boolean")
    return value

def validate_pagination(page, limit):
    if not isinstance(page, int) or page <= 0:
        raise ValueError("Page must be a positive integer")

    if not isinstance(limit, int) or limit <= 0:
        raise ValueError("Limit must be a positive integer")

    if limit > 100:
        raise ValueError("Limit too large (max 100)")

def success_response(data=None):
    return{
        "success": True,
        "data": data,
        "error": None
    }
def error_response(message):
    return{
        "success": False,
        "data": None,
        "error":message
    }

def row_to_task(row):
    return Task(
        id=row[0],
        title=row[1],
        completed=bool(row[2]),
        created_at=row[3],
        updated_at=row[4]
    )


# ---------------- CRUD OPERATIONS ---------------- #

def add_task(task):
    try:
        # Validation
        task.title = validate_title(task.title)
        task.completed = validate_completed(task.completed)

        # Insert
        database.cursor.execute(
            "INSERT INTO tasks (title, completed) VALUES (?, ?)",
            (task.title, int(task.completed))
        )
        database.conn.commit()

        task_id = database.cursor.lastrowid

        # Fetch inserted row
        database.cursor.execute(
            "SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = ?",
            (task_id,)
        )
        row = database.cursor.fetchone()

        if not row:
            logger.error(f"Failed to fetch newly created task {task_id}")
            return error_response("Failed to fetch created task")

        logger.info(f"Task {task_id} created")

        return success_response(row_to_task(row))

    except ValueError as ve:
        logger.warning(f"Validation error in add_task: {ve}")
        return error_response(str(ve))

    except sqlite3.Error as e:
        logger.error(f"Database error in add_task: {e}")
        return error_response("Database error")


def get_task(id):
    try:
        validate_id(id)

        database.cursor.execute(
            "SELECT id, title, completed, created_at, updated_at FROM tasks WHERE id = ?",
            (id,)
        )
        row = database.cursor.fetchone()

        if not row:
            logger.warning(f"Task {id} not found")
            return error_response("Task not found")
        return success_response(row_to_task(row))

    except ValueError as ve:
        logger.warning(f"Validation error in get_task: {ve}")
        return error_response(str(ve))

    except sqlite3.Error as e:
        logger.error(f"Database error in get_task: {e}")
        return error_response("Database error")



def get_all_tasks(page=1, limit=10):
    try:
        validate_pagination(page, limit)

        offset = (page - 1) * limit

        database.cursor.execute(
            "SELECT id, title, completed, created_at, updated_at FROM tasks LIMIT ? OFFSET ?",
            (limit, offset)
        )
        rows = database.cursor.fetchall()

        # Optional: total count (useful for frontend later)
        database.cursor.execute("SELECT COUNT(*) FROM tasks")
        total = database.cursor.fetchone()[0]

        logger.info(f"Fetched page {page} with {len(rows)} tasks")

        return success_response({
            "tasks": [row_to_task(row) for row in rows],
            "page": page,
            "limit": limit,
            "total": total
        })

    except ValueError as ve:
        logger.warning(f"Pagination validation error: {ve}")
        return error_response(str(ve))

    except sqlite3.Error as e:
        logger.error(f"Database error in get_all_tasks: {e}")
        return error_response("Database error")


def update_task(id, title=None, completed=None):
    try:
        validate_id(id)

        task_response = get_task(id)
        if not task_response["success"]:
            return error_response("Task not found")
        
        task = task_response["data"]

        if title is not None:
            title = validate_title(title)

        if completed is not None:
            completed = validate_completed(completed)

        new_title = title if title is not None else task.title
        new_completed = completed if completed is not None else task.completed

        database.cursor.execute(
            "UPDATE tasks SET title = ?, completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (new_title, int(new_completed), id)
        )
        database.conn.commit()

        logger.info(f"Task {id} updated")
        updated = get_task(id)

        return success_response(updated["data"])

    except ValueError as ve:
        logger.warning(f"Validation error in update_task: {ve}")
        return error_response(str(ve))

    except sqlite3.Error as e:
        logger.error(f"Database error in update_task {id}: {e}")
        return error_response("Database error")


def delete_task(id):
    try:
        validate_id(id)

        database.cursor.execute(
            "DELETE FROM tasks WHERE id = ?",
            (id,)
        )
        database.conn.commit()

        if database.cursor.rowcount > 0:
            logger.info(f"Task {id} deleted")
            return success_response(True)

        logger.warning(f"Task {id} not found for deletion")
        return error_response("Task not found")

    except ValueError as ve:
        logger.warning(f"Validation error in delete_task: {ve}")
        return error_response(str(ve))

    except sqlite3.Error as e:
        logger.error(f"Database error in delete_task {id}: {e}")
        return error_response("Database error")


def delete_all_tasks():
    try:
        database.cursor.execute("DELETE FROM tasks")
        database.conn.commit()

        logger.info("All tasks deleted")

        return success_response("All task deleted")

    except sqlite3.Error as e:
        logger.error(f"Database error in delete_all_tasks: {e}")
        return error_response("Database error")
