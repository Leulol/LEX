import { motion } from 'framer-motion';
import { Tab, Task } from '../types';

interface TabsProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  tasks: Task[];
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
];

function count(tasks: Task[], tab: Tab) {
  if (tab === 'all') return tasks.length;
  return tasks.filter((t) => t.status === tab).length;
}

export default function Tabs({ active, onChange, tasks }: TabsProps) {
  return (
    <div className="relative flex items-center gap-0.5 rounded-xl bg-zinc-100 p-1">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        const n = count(tasks, tab.id);
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="relative flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 focus:outline-none"
          >
            {isActive && (
              <motion.div
                layoutId="tab-pill"
                className="absolute inset-0 rounded-lg bg-white shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span
              className={`relative z-10 transition-colors duration-150 ${
                isActive ? 'text-zinc-950' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {tab.label}
            </span>
            {n > 0 && (
              <span
                className={`relative z-10 flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none transition-colors duration-150 ${
                  isActive ? 'bg-zinc-950 text-white' : 'bg-zinc-200 text-zinc-500'
                }`}
              >
                {n}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
