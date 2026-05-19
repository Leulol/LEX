import sqlite3
import json
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


def validate_priority(value):
    if value is None:
        return "medium"
    if not isinstance(value, str):
        raise ValueError("Priority must be a string")

    value = value.strip().lower()
    allowed = {"low", "medium", "high"}
    if value not in allowed:
        raise ValueError("Priority must be low, medium, or high")
    return value


def validate_subtasks(value):
    if value is None:
        return []
    if not isinstance(value, list):
        raise ValueError("Subtasks must be a list")

    cleaned = []
    for item in value:
        if not isinstance(item, dict):
            raise ValueError("Each subtask must be an object")

        title = item.get("title", "")
        if not isinstance(title, str) or title.strip() == "":
            raise ValueError("Each subtask must have a title")

        completed = item.get("completed", False)
        completed = validate_completed(bool(completed))

        cleaned.append({
            "title": title.strip(),
            "completed": completed,
        })

    return cleaned

def validate_sort_order(value):
    if value is None:
        return None
    if isinstance(value, bool):
        raise ValueError("sort_order must be an integer")
    if not isinstance(value, int):
        raise ValueError("sort_order must be an integer")
    if value < 0:
        raise ValueError("sort_order must be >= 0")
    return value


def validate_order_mode(value):
    if value is None:
        return "priority"
    if not isinstance(value, str):
        raise ValueError("order_mode must be a string")
    value = value.strip().lower()
    allowed = {"priority", "manual"}
    if value not in allowed:
        raise ValueError("order_mode must be priority or manual")
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
        priority=row[3],
        subtasks=json.loads(row[4] or "[]"),
        sort_order=row[5],
        order_mode=row[6],
        created_at=row[7],
        updated_at=row[8]
    )


# ---------------- Tasks OPERATIONS ---------------- #

def add_task(task):
    try:
        # Validation
        task.title = validate_title(task.title)
        task.completed = validate_completed(task.completed)
        task.priority = validate_priority(task.priority)
        task.subtasks = validate_subtasks(task.subtasks)
        task.sort_order = validate_sort_order(task.sort_order)
        task.order_mode = validate_order_mode(task.order_mode)
        subtasks_json = json.dumps(task.subtasks)

        # Insert
        with database.db_lock:
            database.cursor.execute(
                "INSERT INTO tasks (title, completed, priority, subtasks, sort_order, order_mode) VALUES (?, ?, ?, ?, ?, ?)",
                (task.title, int(task.completed), task.priority, subtasks_json, task.sort_order, task.order_mode)
            )
            database.conn.commit()

            task_id = database.cursor.lastrowid

            # Fetch inserted row
            database.cursor.execute(
                "SELECT id, title, completed, priority, subtasks, sort_order, order_mode, created_at, updated_at FROM tasks WHERE id = ?",
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

        with database.db_lock:
            database.cursor.execute(
                "SELECT id, title, completed, priority, subtasks, sort_order, order_mode, created_at, updated_at FROM tasks WHERE id = ?",
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

def search_task(title):
    try:    
        title = validate_title(title)
        with database.db_lock:
            database.cursor.execute(
                "SELECT id, title, completed, priority, subtasks, sort_order, order_mode, created_at, updated_at FROM tasks WHERE LOWER(title) = LOWER(?)",
                (title,)
            )
            row = database.cursor.fetchone()
        if not row:
            logger.warning(f"Task {title} NOT Found")
            return error_response("Task NOT Found")
        return success_response(row_to_task(row))
    except ValueError as ve:
        logger.warning(f"Validation error in search_task: {ve}")
        return error_response(str(ve)) 
    except sqlite3.Error as e:
        logger.error(f"Database error in search_task: {e}")
        return error_response("Database error")



def get_all_tasks(page=1, limit=10):
    try:
        validate_pagination(page, limit)

        offset = (page - 1) * limit

        with database.db_lock:
            database.cursor.execute(
                "SELECT id, title, completed, priority, subtasks, sort_order, order_mode, created_at, updated_at FROM tasks LIMIT ? OFFSET ?",
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


def update_task(id, title=None, completed=None, priority=None, subtasks=None, sort_order=None, order_mode=None):
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

        if priority is not None:
            priority = validate_priority(priority)

        if subtasks is not None:
            subtasks = validate_subtasks(subtasks)

        if sort_order is not None:
            sort_order = validate_sort_order(sort_order)

        if order_mode is not None:
            order_mode = validate_order_mode(order_mode)

        new_title = title if title is not None else task.title
        new_completed = completed if completed is not None else task.completed
        new_priority = priority if priority is not None else task.priority
        new_subtasks = subtasks if subtasks is not None else task.subtasks
        new_sort_order = sort_order if sort_order is not None else getattr(task, "sort_order", None)
        new_order_mode = order_mode if order_mode is not None else getattr(task, "order_mode", "priority")
        subtasks_json = json.dumps(new_subtasks)

        with database.db_lock:
            database.cursor.execute(
                "UPDATE tasks SET title = ?, completed = ?, priority = ?, subtasks = ?, sort_order = ?, order_mode = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                (new_title, int(new_completed), new_priority, subtasks_json, new_sort_order, new_order_mode, id)
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


def reorder_tasks(items):
    try:
        if not isinstance(items, list) or len(items) == 0:
            raise ValueError("items must be a non-empty list")

        seen = set()
        cleaned = []
        for item in items:
            if not isinstance(item, dict):
                raise ValueError("Each item must be an object")
            task_id = item.get("id")
            sort_order = item.get("sort_order")
            validate_id(task_id)
            sort_order = validate_sort_order(sort_order)
            if sort_order is None:
                raise ValueError("sort_order is required for reorder items")
            if task_id in seen:
                raise ValueError("Duplicate task id in reorder items")
            seen.add(task_id)
            cleaned.append((sort_order, task_id))

        with database.db_lock:
            # Global manual mode once the user drags anything.
            database.cursor.execute("UPDATE tasks SET order_mode = 'manual'")
            database.cursor.executemany(
                "UPDATE tasks SET sort_order = ?, order_mode = 'manual', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                cleaned
            )
            database.conn.commit()

        return success_response(True)

    except ValueError as ve:
        logger.warning(f"Validation error in reorder_tasks: {ve}")
        return error_response(str(ve))

    except sqlite3.Error as e:
        logger.error(f"Database error in reorder_tasks: {e}")
        return error_response("Database error")


def delete_task(id):
    try:
        validate_id(id)

        with database.db_lock:
            database.cursor.execute(
                "DELETE FROM tasks WHERE id = ?",
                (id,)
            )
            database.conn.commit()
            rowcount = database.cursor.rowcount

        if rowcount > 0:
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
        with database.db_lock:
            database.cursor.execute("DELETE FROM tasks")
            database.conn.commit()

        logger.info("All tasks deleted")

        return success_response("All task deleted")

    except sqlite3.Error as e:
        logger.error(f"Database error in delete_all_tasks: {e}")
        return error_response("Database error")

def delete_completed_tasks():
    try:
        with database.db_lock:
            database.cursor.execute(
                "DELETE FROM tasks WHERE completed = true"                
            )
            database.conn.commit()
        
        logger.info("All Completed Tasks are Deleted")

        return success_response("All Completed Tasks Deleted")
    except sqlite3.Error as e:
        logger.error(f"Database error in delete_completed_tasks: {e}")
        return error_response("Database error")
    





#__________________________________Journal__________________________________________________



def validate_text(text):
    if not text or text.strip() == "":
        raise ValueError("Text can't be None or Empty")
    return text
def row_to_entry(row):
    return {
        "id": row[0],
        "text": row[1],
        "ts": row[2],
        "created_at": row[3]
    }
def add_entry(text, ts):
    try:
        text = validate_text(text)
        with database.db_lock:
            database.cursor.execute(
                "INSERT INTO journal_entries(text, ts) VALUES (?,?)",
                (text, ts)
            )
            database.conn.commit()
            
            entry_id = database.cursor.lastrowid

            # Fetch inserted row
            database.cursor.execute(
                "SELECT id, text, ts, created_at FROM journal_entries WHERE id = ?",
                (entry_id,)
            )
            row = database.cursor.fetchone()

        if not row:
            logger.error(f"Failed to fetch newly created entry {entry_id}")
            return error_response("Failed to fetch created task")

        logger.info(f"Jorunal entry {entry_id} created")

        return success_response(row_to_entry(row))
    except ValueError as ve:
        logger.warning(f"Validation error in Journal_entry: {ve}")
        return error_response(str(ve))

    except sqlite3.Error as e:
        logger.error(f"Database error in Journal_entry: {e}")
        return error_response("Database error")
    
def fetch_entries(page=1, limit=10):
    try:
        validate_pagination(page, limit)

        offset = (page - 1) * limit

        with database.db_lock:
            database.cursor.execute(
                """
                SELECT id, text, ts, created_at
                FROM journal_entries
                ORDER BY ts DESC
                LIMIT ? OFFSET ?
                """,
                (limit, offset)
            )

            rows = database.cursor.fetchall()

            # Total count
            database.cursor.execute(
                "SELECT COUNT(*) FROM journal_entries"
            )

            total = database.cursor.fetchone()[0]

        logger.info(f"Fetched page {page} with {len(rows)} journals")

        return success_response({
            "entries": [row_to_entry(row) for row in rows],
            "page": page,
            "limit": limit,
            "total": total
        })

    except ValueError as ve:
        logger.warning(f"Pagination validation error: {ve}")
        return error_response(str(ve))

    except sqlite3.Error as e:
        logger.error(f"Database error in fetch_entries: {e}")
        return error_response("Database error")

def delete_entry(id):
    try:
        validate_id(id)
        with database.db_lock:
            database.cursor.execute(
                "DELETE FROM journal_entries WHERE id=?",
                (id,)
            )    
            database.conn.commit()

            rowcount = database.cursor.rowcount
            if rowcount > 0:
                logger.info(f"Journal entry {id} deleted")
                return success_response(True)
            logger.warning(f"Journal entry {id} not found for deletion")
            return error_response("Jorunal not found")

    except ValueError as ve:
        logger.warning(f"Validation error in delete_entry: {ve}")
        return error_response(str(ve))

    except sqlite3.Error as e:
        logger.error(f"Database error in delete_entry {id}: {e}")
        return error_response("Database error")


#__________________________________Planner__________________________________________________

def validate_date(value):
    if value is None:
        raise ValueError("date is required")
    if not isinstance(value, str):
        raise ValueError("date must be a string")
    value = value.strip()
    if value == "":
        raise ValueError("date cannot be empty")
    # Expecting YYYY-MM-DD from the frontend <input type="date">
    if len(value) != 10 or value[4] != "-" or value[7] != "-":
        raise ValueError("date must be in YYYY-MM-DD format")
    return value

def validate_done(value):
    if not isinstance(value, bool):
        raise ValueError("done must be a boolean")
    return value

def row_to_planner_item(row):
    return {
        "id": row[0],
        "title": row[1],
        "date": row[2],
        "done": bool(row[3]),
        "created_at": row[4],
        "updated_at": row[5],
    }

def add_planner_item(title, date, done=False):
    try:
        title = validate_title(title)
        date = validate_date(date)
        done = validate_done(bool(done))

        with database.db_lock:
            database.cursor.execute(
                "INSERT INTO planner_items(title, date, done) VALUES (?,?,?)",
                (title, date, int(done)),
            )
            database.conn.commit()

            item_id = database.cursor.lastrowid
            database.cursor.execute(
                "SELECT id, title, date, done, created_at, updated_at FROM planner_items WHERE id = ?",
                (item_id,),
            )
            row = database.cursor.fetchone()

        if not row:
            logger.error(f"Failed to fetch newly created planner item {item_id}")
            return error_response("Failed to fetch created planner item")

        logger.info(f"Planner item {item_id} created")
        return success_response(row_to_planner_item(row))

    except ValueError as ve:
        logger.warning(f"Validation error in add_planner_item: {ve}")
        return error_response(str(ve))

    except sqlite3.Error as e:
        logger.error(f"Database error in add_planner_item: {e}")
        return error_response("Database error")

def fetch_planner_items():
    try:
        with database.db_lock:
            database.cursor.execute(
                """
                SELECT id, title, date, done, created_at, updated_at
                FROM planner_items
                ORDER BY date ASC, id ASC
                """
            )
            rows = database.cursor.fetchall()

        return success_response([row_to_planner_item(r) for r in rows])

    except sqlite3.Error as e:
        logger.error(f"Database error in fetch_planner_items: {e}")
        return error_response("Database error")

def update_planner_item(item_id, done):
    try:
        validate_id(item_id)
        done = validate_done(bool(done))

        with database.db_lock:
            database.cursor.execute(
                "UPDATE planner_items SET done=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
                (int(done), item_id),
            )
            database.conn.commit()

            if database.cursor.rowcount <= 0:
                return error_response("Planner item not found")

            database.cursor.execute(
                "SELECT id, title, date, done, created_at, updated_at FROM planner_items WHERE id = ?",
                (item_id,),
            )
            row = database.cursor.fetchone()

        if not row:
            return error_response("Planner item not found")

        return success_response(row_to_planner_item(row))

    except ValueError as ve:
        logger.warning(f"Validation error in update_planner_item: {ve}")
        return error_response(str(ve))

    except sqlite3.Error as e:
        logger.error(f"Database error in update_planner_item {item_id}: {e}")
        return error_response("Database error")

def delete_planner_item(item_id):
    try:
        validate_id(item_id)
        with database.db_lock:
            database.cursor.execute(
                "DELETE FROM planner_items WHERE id=?",
                (item_id,),
            )
            database.conn.commit()

            if database.cursor.rowcount > 0:
                return success_response(True)
            return error_response("Planner item not found")

    except ValueError as ve:
        logger.warning(f"Validation error in delete_planner_item: {ve}")
        return error_response(str(ve))

    except sqlite3.Error as e:
        logger.error(f"Database error in delete_planner_item {item_id}: {e}")
        return error_response("Database error")
