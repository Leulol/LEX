import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="modal"
              className="relative w-full max-w-sm rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-black/10"
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            >
              <div className="p-6">
                {/* Icon */}
                <motion.div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-950"
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.05, type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <AlertTriangle className="h-5 w-5 text-white" strokeWidth={2} />
                </motion.div>

                {/* Text */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                >
                  <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{message}</p>
                </motion.div>

                {/* Divider */}
                <div className="my-5 h-px bg-zinc-100" />

                {/* Actions */}
                <motion.div
                  className="flex gap-2.5"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                >
                  <button
                    onClick={onCancel}
                    className="flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-medium text-zinc-700 transition-all duration-150 hover:border-zinc-300 hover:bg-zinc-50 active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    className="flex-1 rounded-xl bg-zinc-950 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-zinc-800 active:scale-95"
                  >
                    {confirmLabel}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
