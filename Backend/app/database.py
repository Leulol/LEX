# This is the place where it receives model requests and sends them to the SQLite database.
# It also performs a small migration if an older table schema is found.

import os
import sqlite3
import threading
from .config import Config

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, Config.DB_NAME)

db_lock = threading.Lock()

# FastAPI (and Uvicorn) can handle requests on different threads. Allow this
# connection to be used across threads and guard operations with `db_lock`.
conn = sqlite3.connect(DB_PATH, check_same_thread=False, timeout=30)
cursor = conn.cursor()

def init_db():
    #Task and planner Tabels    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS tasks
    (id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed BOOLEAN NOT NULL,
        priority TEXT NOT NULL DEFAULT 'medium',
        subtasks TEXT NOT NULL DEFAULT '[]',
        sort_order INTEGER,
        order_mode TEXT NOT NULL DEFAULT 'priority',
        scheduled_date TEXT,
        scheduled_time TEXT,
        scheduled_duration INTEGER,
        scheduled_reminder INTEGER,
        scheduled_status TEXT NOT NULL DEFAULT 'unscheduled',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)
    ''')
    # Journal Entries table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS journal_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            ts INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()


def _get_task_columns():
    cursor.execute("PRAGMA table_info(tasks)")
    rows = cursor.fetchall()
    return {r[1] for r in rows}


def _ensure_column(name, ddl):
    cols = _get_task_columns()
    if name in cols:
        return
    cursor.execute(ddl)
    conn.commit()


# Ensure base schema exists before running migrations.
init_db()

# Small migration for older databases (tasks table)
_ensure_column("priority", "ALTER TABLE tasks ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium'")
_ensure_column("subtasks", "ALTER TABLE tasks ADD COLUMN subtasks TEXT NOT NULL DEFAULT '[]'")
_ensure_column("sort_order", "ALTER TABLE tasks ADD COLUMN sort_order INTEGER")
_ensure_column("order_mode", "ALTER TABLE tasks ADD COLUMN order_mode TEXT NOT NULL DEFAULT 'priority'")
_ensure_column("scheduled_date",     "ALTER TABLE tasks ADD COLUMN scheduled_date TEXT")
_ensure_column("scheduled_time",     "ALTER TABLE tasks ADD COLUMN scheduled_time TEXT")
_ensure_column("scheduled_duration", "ALTER TABLE tasks ADD COLUMN scheduled_duration INTEGER")
_ensure_column("scheduled_reminder", "ALTER TABLE tasks ADD COLUMN scheduled_reminder INTEGER")
_ensure_column("scheduled_status",   "ALTER TABLE tasks ADD COLUMN scheduled_status TEXT NOT NULL DEFAULT 'unscheduled'")

