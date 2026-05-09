import TaskItem from "./TaskItem.jsx";

export default function TaskList({
  tasks,
  editingId,
  editingTitle,
  editingPriority,
  editingSubtasks,
  onToggle,
  onDelete,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  onEditingTitleChange,
  onEditingPriorityChange,
  onEditingSubtasksChange,
}) {
  return (
    <ul className="tm-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          isEditing={editingId === task.id}
          editingTitle={editingTitle}
          editingPriority={editingPriority}
          editingSubtasks={editingSubtasks}
          onToggle={onToggle}
          onDelete={onDelete}
          onStartEdit={onStartEdit}
          onCommitEdit={onCommitEdit}
          onCancelEdit={onCancelEdit}
          onEditingTitleChange={onEditingTitleChange}
          onEditingPriorityChange={onEditingPriorityChange}
          onEditingSubtasksChange={onEditingSubtasksChange}
        />
      ))}
    </ul>
  );
}
