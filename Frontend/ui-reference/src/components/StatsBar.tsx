import { motion } from 'framer-motion';
import { Task } from '../types';

interface StatsBarProps {
  tasks: Task[];
}

export default function StatsBar({ tasks }: StatsBarProps) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const stats = [
    { label: 'Total', value: total, sub: 'tasks' },
    { label: 'To Do', value: todo, sub: 'pending' },
    { label: 'In Progress', value: inProgress, sub: 'active' },
    { label: 'Completed', value: done, sub: 'done' },
  ];

  return (
    <div className="space-y-4">
      {/* Stat pills */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm"
          >
            <p className="text-xs font-medium text-zinc-400">{s.label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">{s.value}</p>
            <p className="text-xs text-zinc-300">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-xs font-medium text-zinc-500">Overall Progress</p>
          <p className="text-xs font-semibold text-zinc-950">{pct}%</p>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
          <motion.div
            className="h-full rounded-full bg-zinc-950"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          {done} of {total} tasks completed
        </p>
      </div>
    </div>
  );
}
