import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, Check } from 'lucide-react';
import { useChordsStore } from '../lib/store/chordsStore';

export default function Toast() {
  const toast = useChordsStore((s) => s.toast);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 border shadow-2xl text-xs font-semibold tracking-wide ${
            toast.type === 'error'
              ? 'bg-red-950/90 border-red-700 text-red-200'
              : 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          <span>{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
