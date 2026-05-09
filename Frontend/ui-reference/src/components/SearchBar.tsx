import { Search, X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Priority } from '../types';

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  priorityFilter: Priority | 'all';
  onPriorityChange: (p: Priority | 'all') => void;
}

const priorities: { value: Priority | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Med' },
  { value: 'low', label: 'Low' },
];

export default function SearchBar({ query, onQueryChange, priorityFilter, onPriorityChange }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search tasks..."
          className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-9 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-zinc-400 focus:ring-2 focus:ring-zinc-950/5"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.1 }}
              onClick={() => onQueryChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Priority filter */}
      <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1">
        <SlidersHorizontal className="ml-1.5 h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
        {priorities.map((p) => (
          <button
            key={p.value}
            onClick={() => onPriorityChange(p.value)}
            className={`relative rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-150 ${
              priorityFilter === p.value
                ? 'bg-zinc-950 text-white'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
