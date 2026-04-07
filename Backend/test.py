import sqlite3

conn = sqlite3.connect("tasks.db")
cursor = conn.cursor()

# Insert one test task
cursor.execute("INSERT INTO tasks (name, completed) VALUES (?, ?)", ("Test task", False))
conn.commit()

# Get all tasks
cursor.execute("SELECT * FROM tasks")
print(cursor.fetchall())

conn.close()