#Just for testing the models logics.
from models import Task
from datetime import datetime

print("========== START TEST ==========")

# STEP 1: Clear the database
print("\n[STEP 1] Clearing database...")
task_model = Task()
if task_model.delete_all_tasks():
    print("All tasks deleted.")
else:
    print("delete_all_tasks failed")

print("\n--- After Clearing ---")
tasks = task_model.get_all_tasks()
print(tasks if tasks else "No tasks found")

# STEP 2: Adding tasks
print("\n[STEP 2] Adding tasks...")
t1 = Task(title="Task 1").add_task()
t2 = Task(title="Task 2").add_task()
t3 = Task(title="Task 3").add_task()
print("Added:", t1, t2, t3)

print("\n--- After Adding Tasks ---")
for t in Task().get_all_tasks():
    print(t)

# STEP 3: Get single task
print("\n[STEP 3] Get single task...")
fetched = Task().get_task(t1.id)
print("Fetched task:", fetched)

# STEP 4: Update a task
print("\n[STEP 4] Updating task...")
updated = Task().update_task(t2.id, title="Updated Task 2", completed=True)
print("Updated task:", updated)

print("\n--- After Update ---")
for t in Task().get_all_tasks():
    print(t)

# STEP 5: Delete one task
print("\n[STEP 5] Deleting one task...")
delete_result = Task().delete_task(t1.id)
print("Delete result:", delete_result)

print("\n--- After Deletion ---")
for t in Task().get_all_tasks():
    print(t)

# STEP 6: Edge cases
print("\n[STEP 6] Edge cases...")
print("Get non-existent task:", Task().get_task(9999))
print("Delete non-existent task:", Task().delete_task(9999))
print("Update non-existent task:", Task().update_task(9999, title="No Task"))

# STEP 7: Validation test
print("\n[STEP 7] Validation test...")
try:
    Task(title="   ").add_task()
except ValueError as e:
    print("Validation error caught:", e)

print("\n========== TEST COMPLETE ==========")