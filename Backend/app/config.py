import os

class Config:
    DB_NAME = os.getenv("DB_NAME", "tasks.db")
    DEBUG = os.getenv("DEBUG", "True") == "True"
    MAX_TITLE_LENGTH = 200