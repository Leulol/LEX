import TaskItem from "./TaskItem.jsx";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

export default function TaskList({
  tasks,
  editingId,
  editingTitle,
  editingPriority,
  editingSubtasks,
  onReorder,
  onToggle,
  onDelete,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  onEditingTitleChange,
  onEditingPriorityChange,
  onEditingSubtasksChange,
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const ids = Array.isArray(tasks) ? tasks.map((t) => t.id).filter((id) => Number.isFinite(id)) : [];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => {
        const activeId = event?.active?.id;
        const overId = event?.over?.id;
        if (!activeId || !overId) return;
        if (typeof onReorder === "function") onReorder(Number(activeId), Number(overId));
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
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
      </SortableContext>
    </DndContext>
  );
}
