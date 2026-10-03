import { AlertCircle, Check } from 'lucide-react';
import { useChordsStore } from '../lib/store/chordsStore';

export default function Toast() {
  const toast = useChordsStore((s) => s.toast);
  if (!toast) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 border shadow-2xl text-xs font-semibold tracking-wide transition-all ${
        toast.type === 'error'
          ? 'bg-red-950/90 border-red-700 text-red-200'
          : 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
      }`}
    >
      {toast.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
      <span>{toast.message}</span>
    </div>
  );
}
