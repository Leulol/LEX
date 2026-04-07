#This is the place where it recives the need of data from the models and send it to the database(sqlite) 
#and retrives data

import sqlite3

conn = sqlite3.connect('tasks.db')#i am building a bridge b/n the pyhton code(models/fast api) and the database

cursor = conn.cursor()#let's you send commands like a taxi going in the database and to the models

cursor.execute('''CREATE TABLE IF NOT EXISTS tasks
              (id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                completed BOOLEAN NOT NULL)''')
conn.commit()#save the changes to the database