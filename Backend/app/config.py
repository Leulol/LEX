import os

_DEBUG = os.getenv("DEBUG", "True") == "True"
# Safety-first default: use the test DB unless explicitly overridden via DB_NAME.
_DEFAULT_DB_NAME = "tasks.db"

class Config:
    DB_NAME = os.getenv("DB_NAME", _DEFAULT_DB_NAME)
    DEBUG = _DEBUG
    MAX_TITLE_LENGTH = 200
