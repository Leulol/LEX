import logging

# Create logger
logger = logging.getLogger("task_app")
logger.setLevel(logging.INFO)


#----------Formate on how the logger works----------#
formatter = logging.Formatter(
    "[%(asctime)s] %(levelname)s — %(message)s"
)

# File handler (writes to file)
file_handler = logging.FileHandler("app.log")
file_handler.setFormatter(formatter)

# Stream handler (prints to console)
stream_handler = logging.StreamHandler()
stream_handler.setFormatter(formatter)
#----------------------------------------------------#
# Add handlers
logger.addHandler(file_handler)
logger.addHandler(stream_handler)