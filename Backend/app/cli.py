import argparse
from service import add_task, get_all_tasks, delete_task, delete_all_tasks, update_task
from models import Task


parser = argparse.ArgumentParser(description="Task Manager CLI")

subparsers = parser.add_subparsers(dest="command")#is in the parser argument to idetify the kind of command


# ADD
add_parser = subparsers.add_parser("add")
add_parser.add_argument("title")


# LIST
list_parser = subparsers.add_parser("list")


# DELETE
delete_parser = subparsers.add_parser("delete")
delete_parser.add_argument("id", type=int)


args = parser.parse_args()


if args.command == "add":
    task = Task(title=args.title)
    result = add_task(task)
    print(result)

elif args.command == "list":
    result = get_all_tasks()
    print(result)

elif args.command == "delete":
    result = delete_task(args.id)
    print(result)

else:
    parser.print_help()