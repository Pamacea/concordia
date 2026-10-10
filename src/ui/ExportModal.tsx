import { motion } from 'motion/react';
import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { executeExport } from '../features/export/exporters';
import { useChordsStore } from '../lib/store/chordsStore';
import type { ExportFormat, ExportScope } from '../lib/types';
import FormatPicker from './export/FormatPicker';
import PdfOptions from './export/PdfOptions';
import ScopePicker from './export/ScopePicker';

interface ExportModalProps {
  onClose: () => void;
}

/** Modale d'export : state, backdrop, pickers et footer (`executeExport`). */
export default function ExportModal({ onClose }: ExportModalProps) {
  const groups = useChordsStore((s) => s.groups);
  const diagrams = useChordsStore((s) => s.diagrams);
  const style = useChordsStore((s) => s.style);

  const [format, setFormat] = useState<ExportFormat>('json');
  const [scope, setScope] = useState<ExportScope>('all');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pdfGrid, setPdfGrid] = useState(4);

  const toggleSelectDiagram = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExecute = async () => {
    await executeExport({
      format,
      scope,
      groups,
      diagrams,
      selectedGroupId,
      selectedIds,
      style,
      pdfGrid,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        style={{ maxWidth: '32rem' }}
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Download size={20} className="text-gold" />
            <span>Exporter les Diagrammes</span>
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1 rounded">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <FormatPicker format={format} onChange={setFormat} />

          {format === 'pdf' && <PdfOptions pdfGrid={pdfGrid} onChange={setPdfGrid} />}

          {format !== 'json' && (
            <ScopePicker
              scope={scope}
              onScopeChange={setScope}
              selectedGroupId={selectedGroupId}
              onGroupIdChange={setSelectedGroupId}
              selectedIds={selectedIds}
              onToggleDiagram={toggleSelectDiagram}
            />
          )}
        </div>

        <div className="p-4 border-t border-neutral-800 flex items-center justify-end gap-3 bg-neutral-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => void handleExecute()}
            className="px-5 py-2 bg-gold hover:bg-gold-light text-neutral-950 text-sm font-semibold rounded-xl shadow transition-colors"
          >
            {format === 'json' ? 'Télécharger JSON' : 'Télécharger'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
