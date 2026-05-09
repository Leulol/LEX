import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, CheckSquare } from 'lucide-react';
import { Task, Tab, Priority } from './types';
import { initialTasks } from './data';
import Tabs from './components/Tabs';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import ConfirmModal from './components/ConfirmModal';
import SearchBar from './components/SearchBar';
import StatsBar from './components/StatsBar';
import EmptyState from './components/EmptyState';

let idCounter = initialTasks.length + 1;
function genId() {
  return String(idCounter++);
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');

  // Task modal state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchTab = activeTab === 'all' || t.status === activeTab;
      const matchQuery =
        !query ||
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase()) ||
        t.tags.some((tag) => tag.includes(query.toLowerCase()));
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchTab && matchQuery && matchPriority;
    });
  }, [tasks, activeTab, query, priorityFilter]);

  // Handlers
  const handleAddClick = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleDeleteClick = (task: Task) => {
    setDeletingTask(task);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingTask) return;
    setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
    setConfirmOpen(false);
    setDeletingTask(null);
  };

  const handleToggleDone = (task: Task) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, status: t.status === 'done' ? 'todo' : 'done' }
          : t
      )
    );
  };

  const handleSaveTask = (data: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? { ...t, ...data } : t))
      );
    } else {
      const newTask: Task = {
        ...data,
        id: genId(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      setTasks((prev) => [newTask, ...prev]);
    }
    setTaskModalOpen(false);
    setEditingTask(null);
  };

  const hasFilter = !!query || priorityFilter !== 'all' || activeTab !== 'all';

  const statusLabel: Record<Tab, string> = {
    all: 'All Tasks',
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Completed',
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans antialiased">
      {/* Top nav */}
      <nav className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-950">
              <CheckSquare className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold tracking-tight text-zinc-950">Opus</span>
          </div>

          {/* Date */}
          <p className="hidden text-xs font-medium text-zinc-400 sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>

          {/* Add button */}
          <button
            onClick={handleAddClick}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-950 px-3.5 py-2 text-sm font-medium text-white transition-all hover:bg-zinc-800 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">My Workspace</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Stay on top of everything. Clean slate, sharp mind.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <StatsBar tasks={tasks} />
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-3"
        >
          {/* Tabs */}
          <Tabs active={activeTab} onChange={setActiveTab} tasks={tasks} />

          {/* Search + filter */}
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
          />
        </motion.div>

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-between"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            {statusLabel[activeTab]}
          </h2>
          <span className="text-xs text-zinc-400">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </motion.div>

        {/* Task list */}
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length === 0 ? (
              <EmptyState key="empty" hasFilter={hasFilter} onAdd={handleAddClick} />
            ) : (
              filteredTasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16, scale: 0.97 }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 30,
                    delay: i * 0.04,
                  }}
                >
                  <TaskCard
                    task={task}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onToggleDone={handleToggleDone}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Bottom spacer */}
        <div className="h-8" />
      </main>

      {/* Floating add button (mobile) */}
      <motion.button
        onClick={handleAddClick}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-950 text-white shadow-lg shadow-zinc-950/20 sm:hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 20 }}
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      {/* Modals */}
      <TaskModal
        isOpen={taskModalOpen}
        task={editingTask}
        onSave={handleSaveTask}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
      />

      <ConfirmModal
        isOpen={confirmOpen}
        title="Delete task?"
        message={`"${deletingTask?.title}" will be permanently removed. This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeletingTask(null);
        }}
      />
    </div>
  );
}
