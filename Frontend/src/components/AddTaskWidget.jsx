import { useEffect, useRef, useState } from "react";

export default function AddTaskWidget({
  title,
  priority,
  onTitleChange,
  onPriorityChange,
  onCreate,
  inputRef,
}) {
  const [open, setOpen] = useState(false);
  const innerInputRef = useRef(null);

  function setMergedInputRef(node) {
    innerInputRef.current = node;
    if (!inputRef) return;
    if (typeof inputRef === "function") inputRef(node);
    else inputRef.current = node;
  }

  useEffect(() => {
    if (!open) return;
    innerInputRef.current?.focus?.();
  }, [open]);

  async function handleCreate() {
    if (typeof onCreate !== "function") return;
    const ok = await onCreate();
    if (ok) setOpen(false);
  }

  return (
    <div className={open ? "tm-addWidget tm-addWidgetOpen" : "tm-addWidget"}>
      <button
        className="tm-addWidgetHeader"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="tm-addWidgetTitle">Add Task</span>
        <span className={open ? "tm-caret tm-caretOpen" : "tm-caret"}></span>
      </button>

      <div className="tm-addWidgetBody" aria-hidden={!open} onClick={(e) => e.stopPropagation()}>
        <div className="tm-inputRow">
          <input
            className="tm-input"
            ref={setMergedInputRef}
            value={title}
            onFocus={() => setOpen(true)}
            onChange={(e) => onTitleChange?.(e.target.value)}
            placeholder="Add a task..."
            aria-label="New task title"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") setOpen(false);
            }}
          />
          <select
            className="tm-input tm-select"
            value={priority}
            onChange={(e) => onPriorityChange?.(e.target.value)}
            aria-label="New task priority"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button className="tm-btn tm-btnPrimary" onClick={handleCreate} type="button">
            Add
          </button>
          <button className="tm-btn tm-btnGhost" onClick={() => setOpen(false)} type="button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
