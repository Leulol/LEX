import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SubtaskRow({ subtask, onToggle, onRemove }) {
  const id = subtask?._cid;
  const sortable = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.6 : 1,
  };

  return (
    <div
      className="tm-subtaskRow"
      ref={sortable.setNodeRef}
      style={style}
      data-cid={id}
    >
      <button
        className="tm-dragHandle tm-dragHandleSubtask"
        type="button"
        aria-label="Drag to reorder subtask"
        title="Drag to reorder"
        {...sortable.attributes}
        {...sortable.listeners}
      >
        ::
      </button>

      <input
        type="checkbox"
        checked={Boolean(subtask?.completed)}
        onChange={() => onToggle?.(id)}
      />

      <span className={subtask?.completed ? "tm-subtaskText tm-subtaskDone" : "tm-subtaskText"}>
        {subtask?.title ?? ""}
      </span>

      <button
        className="tm-btn tm-btnGhost tm-btnTight"
        type="button"
        onClick={() => onRemove?.(id)}
      >
        Remove
      </button>
    </div>
  );
}

