# This is the mind where all the logics are made to retrieve the data from the database and send it to the frontend
import database

class Task():
    def __init__(self, id=None, title=None, completed=False):
        self.id = id
        self.title = title
        self.completed = completed

    def __str__(self):
        return f"Task(id={self.id}, title='{self.title}', completed={self.completed})"
    
    def __repr__(self):
        return self.__str__()
    
    def add_task(self):
        database.cursor.execute(
            "INSERT INTO tasks (title, completed) VALUES (?, ?)",
            (self.title, int(self.completed))
        )
        database.conn.commit()
        self.id = database.cursor.lastrowid
        return self

    def get_task(self, id):
        database.cursor.execute(
            "SELECT id, title, completed FROM tasks WHERE id = ?",
            (id,)
        )
        row = database.cursor.fetchone()
        if row:
            return Task(id=row[0], title=row[1], completed=bool(row[2]))
        else:
            return print(f"Task {id} not found")
    
    def get_all_tasks(self):
        database.cursor.execute("SELECT id, title, completed FROM tasks")
        rows = database.cursor.fetchall()
        return [Task(id=row[0], title=row[1], completed=bool(row[2])) for row in rows]

    def delete_task(self, id):
        database.cursor.execute(
            "DELETE FROM tasks WHERE id = ?",  # the id in the bracket will go into the ?
            (id,)
        )
        database.conn.commit()  # saves the changes in the database
        if database.cursor.rowcount > 0:#make sure if there is a task or not
            return print(f"Task {id} deleted")
        else:
            return print(f"Task {id} not found")

# task = Task(title="Test task", completed=False)
# task.add_task()
print(str(Task().get_all_tasks()))
Task().delete_task(1)
print(str(Task().get_all_tasks()))


