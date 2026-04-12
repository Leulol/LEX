#This is where the Task class is defined, which represents a task in the to-do list. 
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
    
   
