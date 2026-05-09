export default function TaskItem({
  task,
  isEditing,
  editingTitle,
  onToggle,
  onDelete,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  onEditingTitleChange,
}) {
  return (
    <li className="tm-item" key={task.id}>
      <button
        className="tm-btn tm-btnGhost tm-btnTight"
        onClick={() => onToggle(task.id)}
        type="button"
        aria-pressed={task.completed}
        title={task.completed ? "Mark as not done" : "Mark as done"}
      >
        {task.completed ? "Undo" : "Done"}
      </button>

      {isEditing ? (
        <input
          className="tm-input tm-inputInline"
          value={editingTitle}
          onChange={(e) => onEditingTitleChange(e.target.value)}
          aria-label="Edit task title"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") onCommitEdit(task.id);
            if (e.key === "Escape") onCancelEdit();
          }}
        />
      ) : (
        <span className={task.completed ? "tm-text tm-textDone" : "tm-text"}>{task.title}</span>
      )}

      {isEditing ? (
        <button
          className="tm-btn tm-btnPrimary tm-btnTight"
          onClick={() => onCommitEdit(task.id)}
          type="button"
          title="Save edit"
        >
          Save
        </button>
      ) : (
        <button
          className="tm-btn tm-btnGhost tm-btnTight"
          onClick={() => onStartEdit(task)}
          type="button"
          title={task.completed ? "Completed tasks can't be edited" : "Edit task"}
          disabled={task.completed}
        >
          Edit
        </button>
      )}

      <button
        className="tm-btn tm-btnDanger tm-btnTight"
        onClick={() => onDelete(task.id)}
        type="button"
        title="Delete task"
      >
        Delete
      </button>
    </li>
  );
}

