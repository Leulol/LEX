import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SubtaskRow from "./SubtaskRow.jsx";

export default function SubtaskList({ subtasks, onChange }) {
  const items = Array.isArray(subtasks) ? subtasks : [];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const ids = items.map((s) => s?._cid).filter(Boolean);

  function onToggle(cid) {
    const next = items.map((s) => (s?._cid === cid ? { ...s, completed: !s?.completed } : s));
    onChange?.(next);
  }

  function onRemove(cid) {
    const next = items.filter((s) => s?._cid !== cid);
    onChange?.(next);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => {
        const activeId = event?.active?.id;
        const overId = event?.over?.id;
        if (!activeId || !overId) return;
        if (activeId === overId) return;

        const from = items.findIndex((s) => s?._cid === activeId);
        const to = items.findIndex((s) => s?._cid === overId);
        if (from < 0 || to < 0) return;

        onChange?.(arrayMove(items, from, to));
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="tm-subtaskList" role="list">
          {items.map((s) => (
            <SubtaskRow key={s?._cid} subtask={s} onToggle={onToggle} onRemove={onRemove} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
