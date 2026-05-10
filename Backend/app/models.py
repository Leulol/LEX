#This is where the Task class is defined, which represents a task in the to-do list. 
import sqlite3
from datetime import datetime

class Task():
    def __init__(
        self,
        id=None,
        title=None,
        completed=False,
        priority="medium",
        subtasks=None,
        sort_order=None,
        order_mode="priority",
        created_at=None,
        updated_at=None,
    ):
        self.id = id
        self.title = title
        self.completed = completed
        self.priority = priority
        self.subtasks = subtasks if subtasks is not None else []
        self.sort_order = sort_order
        self.order_mode = order_mode
        self.created_at = created_at
        self.updated_at = updated_at

    def __str__(self):
        return f"Task(id={self.id}, title='{self.title}', completed={self.completed}, priority={self.priority}, subtasks={self.subtasks}, sort_order={self.sort_order}, order_mode={self.order_mode}, created_at={self.created_at}, updated_at={self.updated_at})"
    
    def __repr__(self):
        return self.__str__()
    
   
