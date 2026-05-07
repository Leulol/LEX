#Just for testing the models logics.
import os
from .models import Task
os.environ["DB_NAME"] = "test_tasks.db"  # Use a separate test database
os.environ["DEBUG"] = "False"  # Enable debug mode for testing
from . import service  # Import after setting the environment variable

print("========== START TEST ==========")

def task_id_from_response(resp, fallback=1):
    if not isinstance(resp, dict) or not resp.get("success"):
        return fallback
    task = resp.get("data")
    return getattr(task, "id", fallback)

def tasks_from_get_all(resp):
    if not isinstance(resp, dict) or not resp.get("success"):
        return []
    data = resp.get("data") or {}
    return data.get("tasks") or []

# STEP 1: Clear the database
print("\n[STEP 1] Clearing database...")
if service.delete_all_tasks():
    print("All tasks deleted.")
else:
    print("delete_all_tasks failed")

print("\n--- After Clearing ---")
tasks_resp = service.get_all_tasks()
print(tasks_resp if tasks_resp else "No tasks found")

# STEP 2: Adding tasks
print("\n[STEP 2] Adding tasks...")
try:
    t1 = service.add_task(Task(title="Task 1"))
    print("Added t1:", t1)
except ValueError as e:
    print("Error adding t1:", e)

try:
    t2 = service.add_task(Task(title="Task 2"))
    print("Added t2:", t2)
except ValueError as e:
    print("Error adding t2:", e)

try:
    t3 = service.add_task(Task(title="Task 3"))
    print("Added t3:", t3)
except ValueError as e:
    print("Error adding t3:", e)

print("\n--- After Adding Tasks ---")
for t in tasks_from_get_all(service.get_all_tasks()):
    print(t)

# STEP 3: Get single task
print("\n[STEP 3] Get single task...")
fetched = service.get_task(task_id_from_response(t1, 1))
print("Fetched task:", fetched)

# STEP 4: Update a task
print("\n[STEP 4] Updating task...")
updated = service.update_task(task_id_from_response(t2, 2), title="Updated Task 2", completed=True)
print("Updated task:", updated)

print("\n--- After Update ---")
for t in tasks_from_get_all(service.get_all_tasks()):
    print(t)

# STEP 5: Delete one task
print("\n[STEP 5] Deleting one task...")
delete_result = service.delete_task(task_id_from_response(t1, 1))
print("Delete result:", delete_result)

print("\n--- After Delete ---")
for t in tasks_from_get_all(service.get_all_tasks()):
    print(t)

# STEP 6: Validation Tests
print("\n[STEP 6] Validation Tests...")

# Test adding task with empty title
print("\n--- Test: Add task with empty title ---")
try:
    invalid_task = service.add_task(Task(title=""))
    print("Unexpectedly added:", invalid_task)
except ValueError as e:
    print("Correctly caught error:", e)

# Test adding task with whitespace-only title
print("\n--- Test: Add task with whitespace-only title ---")
try:
    invalid_task = service.add_task(Task(title="   "))
    print("Unexpectedly added:", invalid_task)
except ValueError as e:
    print("Correctly caught error:", e)

# Test updating task with empty title
print("\n--- Test: Update task with empty title ---")
if t3:
    updated_invalid = service.update_task(task_id_from_response(t3, 3), title="")
    print("Update with empty title result:", updated_invalid)

# Test updating task with whitespace-only title
print("\n--- Test: Update task with whitespace-only title ---")
if t3:
    updated_invalid = service.update_task(task_id_from_response(t3, 3), title="   ")
    print("Update with whitespace title result:", updated_invalid)

print("\n========== END TEST ==========")

print("\n--- After Deletion ---")
for t in tasks_from_get_all(service.get_all_tasks()):
    print(t)

# STEP 6: Edge cases
print("\n[STEP 6] Edge cases...")
print("Get non-existent task:", service.get_task(9999))
print("Delete non-existent task:", service.delete_task(9999))
print("Update non-existent task:", service.update_task(9999, title="No Task"))

# STEP 7: Validation test
print("\n[STEP 7] Validation test...")
try:
    service.add_task(Task(title=""))
except ValueError as e:
    print("Validation error caught:", e)

print("\n========== TEST COMPLETE ==========")
