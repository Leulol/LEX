#This is where the Task class is defined, which represents a task in the to-do list. It includes methods for adding, retrieving, and deleting tasks from the SQLite database.
#The Error handling is done using try-except blocks to catch any database errors that may occur during the operations. The class also includes validation to ensure that the title of the task is not empty.
import database
import sqlite3
from datetime import datetime

class Task():
    def __init__(self, id=None, title=None, completed=False, created_at=None, updated_at=None):
        self.id = id
        self.title = title
        self.completed = completed
        self.created_at = created_at
        self.updated_at = updated_at

    def __str__(self):
        return f"Task(id={self.id}, title='{self.title}', completed={self.completed}, created_at={self.created_at}, updated_at={self.updated_at})"
    
    def __repr__(self):
        return self.__str__()
    
   
