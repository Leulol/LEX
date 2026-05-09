import TaskItem from "./TaskItem.jsx";

export default function TaskList({
  tasks,
  editingId,
  editingTitle,
  onToggle,
  onDelete,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  onEditingTitleChange,
}) {
  return (
    <ul className="tm-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          isEditing={editingId === task.id}
          editingTitle={editingTitle}
          onToggle={onToggle}
          onDelete={onDelete}
          onStartEdit={onStartEdit}
          onCommitEdit={onCommitEdit}
          onCancelEdit={onCancelEdit}
          onEditingTitleChange={onEditingTitleChange}
        />
      ))}
    </ul>
  );
}

