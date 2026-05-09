import { motion } from 'framer-motion';
import { CheckCircle2, Plus } from 'lucide-react';

interface EmptyStateProps {
  hasFilter: boolean;
  onAdd: () => void;
}

export default function EmptyState({ hasFilter, onAdd }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <CheckCircle2 className="h-6 w-6 text-zinc-300" />
      </div>
      <p className="text-sm font-medium text-zinc-700">
        {hasFilter ? 'No matching tasks' : 'No tasks yet'}
      </p>
      <p className="mt-1 text-xs text-zinc-400">
        {hasFilter ? 'Try a different filter or search term.' : 'Create your first task to get started.'}
      </p>
      {!hasFilter && (
        <button
          onClick={onAdd}
          className="mt-5 flex items-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-zinc-800 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add task
        </button>
      )}
    </motion.div>
  );
}
