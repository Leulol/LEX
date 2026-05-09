import { motion } from 'framer-motion';
import { Calendar, Tag, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleDone: (task: Task) => void;
}

const priorityConfig = {
  low: { dot: 'bg-zinc-300', text: 'text-zinc-400', label: 'Low' },
  medium: { dot: 'bg-zinc-500', text: 'text-zinc-500', label: 'Med' },
  high: { dot: 'bg-zinc-950', text: 'text-zinc-900', label: 'High' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(dateStr: string, status: string) {
  if (status === 'done') return false;
  const due = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export default function TaskCard({ task, onEdit, onDelete, onToggleDone }: TaskCardProps) {
  const isDone = task.status === 'done';
  const overdue = isOverdue(task.dueDate, task.status);
  const pc = priorityConfig[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      className={`group relative rounded-2xl border bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md ${
        isDone ? 'border-zinc-100' : 'border-zinc-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleDone(task)}
          className="relative mt-0.5 flex-shrink-0"
          aria-label="Toggle complete"
        >
          <motion.div
            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
              isDone
                ? 'border-zinc-950 bg-zinc-950'
                : 'border-zinc-300 bg-white hover:border-zinc-500'
            }`}
            whileTap={{ scale: 0.85 }}
          >
            {isDone && (
              <motion.svg
                viewBox="0 0 12 9"
                className="h-2.5 w-2.5 stroke-white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <motion.path d="M1 4.5L4.5 8L11 1" />
              </motion.svg>
            )}
          </motion.div>
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`text-sm font-medium leading-snug transition-colors ${
                isDone ? 'text-zinc-400 line-through' : 'text-zinc-900'
              }`}
            >
              {task.title}
            </h3>

            {/* Action buttons */}
            <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <button
                onClick={() => onEdit(task)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete(task)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-300" />
            </div>
          </div>

          {task.description && (
            <p className={`mt-0.5 line-clamp-2 text-xs leading-relaxed ${isDone ? 'text-zinc-300' : 'text-zinc-500'}`}>
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
            {/* Priority pill */}
            <span className={`flex items-center gap-1 text-xs font-medium ${pc.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${pc.dot}`} />
              {pc.label}
            </span>

            {/* Due date */}
            <span className={`flex items-center gap-1 text-xs ${overdue ? 'font-medium text-red-500' : isDone ? 'text-zinc-300' : 'text-zinc-400'}`}>
              <Calendar className="h-3 w-3" />
              {overdue ? `Overdue · ${formatDate(task.dueDate)}` : formatDate(task.dueDate)}
            </span>

            {/* Tags */}
            {task.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-0.5 rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="text-xs text-zinc-400">+{task.tags.length - 2}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
