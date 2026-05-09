import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag } from 'lucide-react';
import { Task, Priority, Status } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  task?: Task | null;
  onSave: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const statusOptions: { value: Status; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export default function TaskModal({ isOpen, task, onSave, onClose }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>('todo');
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.dueDate);
      setTags(task.tags);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
      setDueDate('');
      setTags([]);
    }
    setErrors({});
    setTagInput('');
  }, [task, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!dueDate) newErrors.dueDate = 'Due date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ title: title.trim(), description: description.trim(), priority, status, dueDate, tags });
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && !tagInput && tags.length) removeTag(tags[tags.length - 1]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="modal"
              className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-black/10"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
                <h2 className="text-sm font-semibold tracking-tight text-zinc-950">
                  {task ? 'Edit Task' : 'New Task'}
                </h2>
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-4 p-6">
                {/* Title */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-300 outline-none transition-all focus:border-zinc-400 focus:ring-2 focus:ring-zinc-950/5 ${
                      errors.title ? 'border-red-300 bg-red-50' : 'border-zinc-200 bg-white'
                    }`}
                  />
                  {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add more details..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-300 outline-none transition-all focus:border-zinc-400 focus:ring-2 focus:ring-zinc-950/5"
                  />
                </div>

                {/* Priority + Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500">Priority</label>
                    <div className="flex gap-1.5">
                      {priorityOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setPriority(opt.value)}
                          className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-all duration-150 ${
                            priority === opt.value
                              ? 'border-zinc-950 bg-zinc-950 text-white'
                              : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-500">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as Status)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-all focus:border-zinc-400 focus:ring-2 focus:ring-zinc-950/5"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-all focus:border-zinc-400 focus:ring-2 focus:ring-zinc-950/5 ${
                      errors.dueDate ? 'border-red-300 bg-red-50' : 'border-zinc-200 bg-white'
                    }`}
                  />
                  {errors.dueDate && <p className="mt-1 text-xs text-red-500">{errors.dueDate}</p>}
                </div>

                {/* Tags */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-500">Tags</label>
                  <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 transition-all focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-950/5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-0.5 text-zinc-400 hover:text-zinc-700">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      onBlur={addTag}
                      placeholder={tags.length === 0 ? 'Add tags...' : ''}
                      className="min-w-[80px] flex-1 bg-transparent text-xs text-zinc-700 placeholder-zinc-300 outline-none"
                    />
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">Press Enter or comma to add a tag</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-2.5 border-t border-zinc-100 px-6 py-4">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-50 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 rounded-xl bg-zinc-950 py-2.5 text-sm font-medium text-white transition-all hover:bg-zinc-800 active:scale-95"
                >
                  {task ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
