import { useMemo, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SubtaskList from "./SubtaskList.jsx";

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
  const sortable = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.6 : 1,
  };

  const progress = useMemo(() => {
    const items = Array.isArray(task.subtasks) ? task.subtasks : [];
    if (items.length === 0) return null;
    const done = items.reduce((n, s) => n + (s?.completed ? 1 : 0), 0);{/*How many tasks are done in number*/}
    const pct = Math.round((done / items.length) * 100);
    return { done, total: items.length, pct };
  }, [task.subtasks]);

  const priorityLabel = task.priority === "high" ? "High" : task.priority === "low" ? "Low" : "Medium";

  const priorityDot =
    task.priority === "high" ? "#ef4444" : task.priority === "low" ? "#22c55e" : "#f59e0b";

  function addSubtask() {
    const t = newSubtaskTitle.trim();
    if (t === "") return;
    const cid =
      globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const next = [
      ...(Array.isArray(editingSubtasks) ? editingSubtasks : []),
      { _cid: cid, title: t, completed: false },
    ];
    onEditingSubtasksChange(next);
    setNewSubtaskTitle("");
  }

  return (
    <li
      className={isEditing ? "tm-item tm-itemEditing" : "tm-item"}
      key={task.id}
      ref={sortable.setNodeRef}
      style={style}
    >
      <button
        className="tm-dragHandle"
        type="button"
        aria-label="Drag to reorder"
        title="Drag to reorder"
        {...sortable.attributes}
        {...sortable.listeners}
      >
        ⋮⋮
      </button>

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
        <button
          className="tm-itemHeader"
          type="button"
          aria-expanded={isEditing}
          onClick={() => {
            if (isEditing) {
              onCancelEdit();
              return;
            }
            if (task.completed) return;
            onStartEdit(task);
          }}
          title={task.completed ? "Completed tasks can't be edited" : isEditing ? "Collapse details" : "Expand details"}
        />

        {/* --- Updated tm-itemTitleRow logic and cleaned up details --- */}
        <div 
          className="tm-itemTitleRow" 
          onClick={() => {
            if (task.completed || isEditing) return; // Don't trigger startEdit if already editing
            onStartEdit(task);
          }}
          style={{ cursor: task.completed ? 'default' : 'pointer' }}
        >
          {isEditing ? (
            /* --- EDITING MODE: Now with e.stopPropagation() to prevent retraction --- */
            <div className="tm-editInlineWrapper" style={{
                display: 'flex', 
                justifyContent: 'space-between', // Pushes items to opposite ends
                alignItems: 'center', 
                gap: '15px', 
                width: '100%' 
              }} 
              onClick={(e) => e.stopPropagation()}
            >              
              <input
                className="tm-input tm-inputInline"
                value={editingTitle}                   
                onChange={(e) => onEditingTitleChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onCommitEdit(task.id);
                  if (e.key === "Escape") onCancelEdit();
                }}
              />
              
              <select
                className="tm-input tm-select tm-selectInline"
                style={{
                width: '100px',    
                padding: '8px', 
                flexShrink: 0}}
                value={editingPriority}
                onChange={(e) => onEditingPriorityChange(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          ) : (
            /* --- VIEW MODE --- */
            <>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <span className={task.completed ? "tm-text tm-textDone" : "tm-text"}>
                  {task.title}
                </span>
                {/* --- ADD THIS PROGRESS BAR SECTION --- */}               
                {progress && (
                  <div className="tm-progressContainer">
                    <div className="tm-progressBar">
                      <div 
                        className="tm-progressFill" 
                        style={{ width: `${progress.pct}%` }} 
                      />
                    </div>
                    <span className="tm-progressMeta">{progress.pct}%</span>
                  </div>
                )}
              </div>

              <div className="tm-itemTitleRight">
                <span className="tm-priority">
                  <span
                    aria-hidden="true"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: priorityDot,
                      display: "inline-block",
                      marginRight: 6,
                      transform: "translateY(-1px)",
                    }}
                  />
                  {priorityLabel}
                </span>
                <span className={isEditing ? "tm-caret tm-caretOpen" : "tm-caret"}>
                  ▾
                </span>
              </div>
            </>
          )}
        </div>

        <div className={isEditing ? "tm-details tm-detailsOpen" : "tm-details"}>
          {isEditing ? (
            <div className="tm-subtasks">
              <div className="tm-subtasksHead">Subtasks</div>

              <SubtaskList subtasks={editingSubtasks} onChange={onEditingSubtasksChange} />

              <div className="tm-subtaskAdd">
                <input
                  className="tm-input tm-inputInline"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add subtask..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addSubtask();
                  }}
                />
                <button className="tm-btn tm-btnGhost" type="button" onClick={addSubtask}>
                  Add
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="tm-itemActions" aria-label="Task actions">
        {isEditing ? (
          <>
            <button className="tm-newBtn" onClick={() => onCommitEdit(task.id)} type="button" title="Save edit">
              Save
            </button>
            <button className="tm-btn tm-btnGhost" onClick={() => onCancelEdit()} type="button" title="Cancel edit">
              Cancel
            </button>
          </>
        ) : (
          <button className="tm-iconBtn tm-iconBtnDanger" onClick={() => onDelete(task.id)} type="button" title="Delete task">
            🗑
          </button>
        )}
      </div>
    </li>
  );
}
