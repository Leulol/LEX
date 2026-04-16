# This is the place where it receives model requests and sends them to the SQLite database.
# It also performs a small migration if an older table schema is found.

import os
import sqlite3

BASE_DIR = os.path.dirname(__file__)
DB_NAME = os.getenv("DB_NAME", "tasks.db")
DB_PATH = os.path.join(BASE_DIR, DB_NAME)

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute('''CREATE TABLE IF NOT EXISTS tasks
              (id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                completed BOOLEAN NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')
conn.commit()


