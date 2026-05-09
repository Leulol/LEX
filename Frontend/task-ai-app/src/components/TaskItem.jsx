import { useMemo, useState } from "react";

export default function TaskItem({
  task,
  isEditing,
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
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const progress = useMemo(() => {
    const items = Array.isArray(task.subtasks) ? task.subtasks : [];
    if (items.length === 0) return null;
    const done = items.reduce((n, s) => n + (s?.completed ? 1 : 0), 0);
    const pct = Math.round((done / items.length) * 100);
    return { done, total: items.length, pct };
  }, [task.subtasks]);

  const priorityLabel = task.priority === "high" ? "High" : task.priority === "low" ? "Low" : "Medium";

  function addSubtask() {
    const t = newSubtaskTitle.trim();
    if (t === "") return;
    const next = [...(Array.isArray(editingSubtasks) ? editingSubtasks : []), { title: t, completed: false }];
    onEditingSubtasksChange(next);
    setNewSubtaskTitle("");
  }

  return (
    <li className="tm-item" key={task.id}>
      <button
        className={task.completed ? "tm-toggleBtn tm-toggleBtnDone" : "tm-toggleBtn"}
        onClick={() => onToggle(task.id)}
        type="button"
        aria-pressed={task.completed}
        aria-label="Toggle complete"
        title={task.completed ? "Mark as not done" : "Mark as done"}
      >
        {task.completed ? "✓" : ""}
      </button>

      <div className="tm-itemMain">
        <div className="tm-itemTitleRow">
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

          <span
            className={
              task.priority === "high"
                ? "tm-priority tm-priorityHigh"
                : task.priority === "low"
                  ? "tm-priority tm-priorityLow"
                  : "tm-priority tm-priorityMedium"
            }
            title={`Priority: ${priorityLabel}`}
          >
            {priorityLabel}
          </span>
        </div>

        {!isEditing && progress ? (
          <div className="tm-progress" aria-label={`Progress: ${progress.pct}%`}>
            <div className="tm-progressBar">
              <div className="tm-progressFill" style={{ width: `${progress.pct}%` }} />
            </div>
            <div className="tm-progressMeta">
              {progress.done}/{progress.total} ({progress.pct}%)
            </div>
          </div>
        ) : null}

        {isEditing ? (
          <div className="tm-editExtras">
            <label className="tm-editField">
              <span className="tm-editLabel">Priority</span>
              <select
                className="tm-input tm-select tm-selectInline"
                value={editingPriority}
                onChange={(e) => onEditingPriorityChange(e.target.value)}
                aria-label="Edit priority"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <div className="tm-subtasks">
              <div className="tm-subtasksHead">Subtasks</div>

              {(Array.isArray(editingSubtasks) ? editingSubtasks : []).map((s, idx) => (
                <div className="tm-subtaskRow" key={`${idx}-${s?.title ?? ""}`}>
                  <input
                    type="checkbox"
                    checked={Boolean(s?.completed)}
                    onChange={() => {
                      const next = (Array.isArray(editingSubtasks) ? editingSubtasks : []).map((x, i) =>
                        i === idx ? { ...x, completed: !Boolean(x?.completed) } : x
                      );
                      onEditingSubtasksChange(next);
                    }}
                    aria-label={`Toggle subtask ${idx + 1}`}
                  />
                  <span className={s?.completed ? "tm-subtaskText tm-subtaskDone" : "tm-subtaskText"}>
                    {s?.title ?? ""}
                  </span>
                  <button
                    className="tm-btn tm-btnGhost tm-btnTight"
                    type="button"
                    title="Remove subtask"
                    onClick={() => {
                      const next = (Array.isArray(editingSubtasks) ? editingSubtasks : []).filter(
                        (_, i) => i !== idx
                      );
                      onEditingSubtasksChange(next);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="tm-subtaskAdd">
                <input
                  className="tm-input tm-inputInline"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add subtask..."
                  aria-label="New subtask title"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addSubtask();
                  }}
                />
                <button className="tm-btn tm-btnGhost" type="button" onClick={addSubtask}>
                  Add
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="tm-itemActions" aria-label="Task actions">
        {isEditing ? (
          <button
            className="tm-newBtn"
            onClick={() => onCommitEdit(task.id)}
            type="button"
            title="Save edit"
          >
            Save
          </button>
        ) : (
          <>
            <button
              className="tm-iconBtn"
              onClick={() => onStartEdit(task)}
              type="button"
              title={task.completed ? "Completed tasks can't be edited" : "Edit task"}
              disabled={task.completed}
            >
              ✎
            </button>
            <button
              className="tm-iconBtn tm-iconBtnDanger"
              onClick={() => onDelete(task.id)}
              type="button"
              title="Delete task"
            >
              🗑
            </button>
          </>
        )}
      </div>
    </li>
  );
}
