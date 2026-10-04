import { useState } from 'react';
import { CheckSquare, Download, Square, X } from 'lucide-react';
import { executeExport } from '../features/export/exporters';
import { useChordsStore } from '../lib/store/chordsStore';
import type { ExportFormat, ExportScope } from '../lib/types';

interface ExportModalProps {
  onClose: () => void;
}

const PDF_GRID_OPTIONS = [1, 2, 4, 6, 8, 12] as const;

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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-[32rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Download size={20} className="text-gold" />
            <span>Exporter les Diagrammes</span>
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gold uppercase tracking-wider">
              Format d'export
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['json', 'png', 'svg', 'pdf'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-colors ${
                    format === fmt
                      ? 'bg-gold border-gold text-neutral-950 shadow'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {format === 'json' && (
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-xs text-neutral-400">
              L'exportation en JSON sauvegarde l'intégralité de vos groupes, de vos accords, de
              leurs positions et de leurs paramètres de personnalisation dans un fichier unique.
            </div>
          )}

          {format === 'pdf' && (
            <div className="space-y-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <label className="text-xs font-bold text-gold uppercase tracking-wider">
                Disposition PDF (par page A4)
              </label>
              <select
                value={pdfGrid}
                onChange={(e) => setPdfGrid(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-gold font-medium"
              >
                {PDF_GRID_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} diagramme{n > 1 ? 's' : ''} par page
                    {n === 4 ? ' (Grid 2x2)' : n === 6 ? ' (Grid 2x3)' : n === 8 ? ' (Grid 2x4)' : n === 12 ? ' (Grid 3x4)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {format !== 'json' && (
            <>
              <div className="space-y-3">
                <label className="text-xs font-bold text-gold uppercase tracking-wider">
                  Périmètre
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-sm text-neutral-200 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={scope === 'all'}
                      onChange={() => setScope('all')}
                      className="text-gold focus:ring-gold h-4 w-4"
                    />
                    <span>Tous les diagrammes ({Object.keys(diagrams).length})</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-sm text-neutral-200 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={scope === 'group'}
                      onChange={() => setScope('group')}
                      className="text-gold focus:ring-gold h-4 w-4"
                    />
                    <span>Un groupe spécifique</span>
                  </label>

                  {scope === 'group' && (
                    <select
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      className="w-full ml-6 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-gold font-medium"
                    >
                      <option value="">— Choisir un groupe —</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.diagramIds.length} accords)
                        </option>
                      ))}
                    </select>
                  )}

                  <label className="flex items-center gap-2.5 text-sm text-neutral-200 cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={scope === 'custom'}
                      onChange={() => setScope('custom')}
                      className="text-gold focus:ring-gold h-4 w-4"
                    />
                    <span>Sélection personnalisée</span>
                  </label>
                </div>
              </div>

              {scope === 'custom' && (
                <div className="max-h-48 overflow-y-auto bg-neutral-950 rounded-xl border border-neutral-800 p-2 space-y-1">
                  {Object.values(diagrams).map((d) => {
                    const isChecked = selectedIds.has(d.id);
                    return (
                      <div
                        key={d.id}
                        onClick={() => toggleSelectDiagram(d.id)}
                        className="flex items-center gap-2 p-1.5 hover:bg-neutral-900 rounded-lg cursor-pointer text-xs text-neutral-300"
                      >
                        {isChecked ? (
                          <CheckSquare size={16} className="text-gold" />
                        ) : (
                          <Square size={16} className="text-neutral-600" />
                        )}
                        <span>{d.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
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
      </div>
    </div>
  );
}
