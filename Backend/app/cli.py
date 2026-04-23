import argparse
import os
os.environ["DB_NAME"] = "test_tasks.db"  # Use a separate test database
os.environ["DEBUG"] = "False"  # Disable debug mode for testing
import sys

if __package__:
    from .service import add_task, get_task, search_task, get_all_tasks, delete_task, delete_all_tasks, update_task
    from .models import Task
else:
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    from app.service import add_task, get_task, search_task, get_all_tasks, delete_task, delete_all_tasks, update_task
    from app.models import Task

try:
    from tabulate import tabulate
except ModuleNotFoundError:
    tabulate = None



parser = argparse.ArgumentParser(description="Task Manager CLI")

subparsers = parser.add_subparsers(dest="command")#is in the parser argument to idetify the kind of command

#FORMATE
def formatter(result):
    if isinstance(result, bool):
        print(result)
        return

    if result is None:
        print("No data")
        return

    if isinstance(result, dict) and "tasks" in result:
        result = result["tasks"]

    if not result:
        print("No tasks found")
        return

    if hasattr(result, "id"):
        data = [[result.id, result.title, result.completed]]
    else:
        data = [[t.id, t.title, t.completed] for t in result]
    
    headers = ["ID", "Title", "Completed"]

    if tabulate is not None:
        print(tabulate(data, headers=headers, tablefmt="grid"))
        return

    # Fallback formatter when tabulate is not installed.
    rows = [headers] + data
    widths = [max(len(str(row[i])) for row in rows) for i in range(len(headers))]

    def format_row(row):
        return " | ".join(str(value).ljust(widths[i]) for i, value in enumerate(row))

    print(format_row(headers))
    print("-+-".join("-" * width for width in widths))
    for row in data:
        print(format_row(row))


# ADD
add_parser = subparsers.add_parser("add")
add_parser.add_argument("title")


# LIST
list_parser = subparsers.add_parser("list")

#GET
get_parser = subparsers.add_parser("get")
get_parser.add_argument("id", type=int)

#Search
search_parser = subparsers.add_parser("search")
search_parser.add_argument("title", type=str)

# CLEAR
clear_parser = subparsers.add_parser("clear")


# DELETE
delete_parser = subparsers.add_parser("delete")
delete_parser.add_argument("id", type=int)

#UPDATE
update_parser = subparsers.add_parser("update")
update_parser.add_argument("id", type=int)
update_parser.add_argument("title", type=str)

#Completed
completed_parser = subparsers.add_parser("completed")
completed_parser.add_argument("id", type=int)

#PENDING
pending_parase = subparsers.add_parser("pending")
pending_parase.add_argument("id", type=int)

args = parser.parse_args()

def check(result):
    if not result["success"]:
        print("Error: ", result["error"])
        return False
    return True

if args.command == "add":
    task = Task(title=args.title)
    result = add_task(task)
    if check(result):
        formatter(result["data"])

elif args.command == "get":
    result = get_task(id = args.id)
    if check(result):
        formatter(result["data"])

elif args.command == "search":
    result = search_task(title = args.title)
    if check(result):
        formatter(result["data"])

elif args.command == "list":
    result = get_all_tasks()
    if check(result):
        formatter(result["data"])

elif args.command == "delete":
    result = delete_task(args.id)
    if check(result):
        print("Task deleted successfully.")

elif args.command == "update":
    result = update_task(id = args.id, title = args.title)
    if check(result):
        formatter(result["data"])

elif args.command == "completed":
    result = update_task(id = args.id, completed = True)
    if check(result):
        formatter(result["data"])

elif args.command == "clear":
    result = delete_all_tasks()
    if check(result):
        print(result["data"])

elif args.command == "pending":
    result = update_task(id=args.id, completed=False)
    if check(result):
        formatter(result["data"])

else:
    parser.print_help()
