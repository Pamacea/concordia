import { CheckSquare, Square } from 'lucide-react';
import { useChordsStore } from '../../lib/store/chordsStore';
import type { ExportScope } from '../../lib/types';
import RadioCard from './RadioCard';

interface ScopePickerProps {
  scope: ExportScope;
  onScopeChange: (scope: ExportScope) => void;
  selectedGroupId: string;
  onGroupIdChange: (groupId: string) => void;
  selectedIds: Set<string>;
  onToggleDiagram: (id: string) => void;
}

/** Périmètre d'export : tous / un groupe / sélection personnalisée + liste. */
export default function ScopePicker({
  scope,
  onScopeChange,
  selectedGroupId,
  onGroupIdChange,
  selectedIds,
  onToggleDiagram,
}: ScopePickerProps) {
  const groups = useChordsStore((s) => s.groups);
  const diagrams = useChordsStore((s) => s.diagrams);

  return (
    <>
      <div className="space-y-3">
        <label className="text-xs font-bold text-gold uppercase tracking-wider">Périmètre</label>
        <div className="space-y-2">
          <RadioCard name="scope" checked={scope === 'all'} onChange={() => onScopeChange('all')}>
            Tous les diagrammes ({Object.keys(diagrams).length})
          </RadioCard>

          <RadioCard
            name="scope"
            checked={scope === 'group'}
            onChange={() => onScopeChange('group')}
          >
            Un groupe spécifique
          </RadioCard>

          {scope === 'group' && (
            <select
              value={selectedGroupId}
              onChange={(e) => onGroupIdChange(e.target.value)}
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

          <RadioCard
            name="scope"
            checked={scope === 'custom'}
            onChange={() => onScopeChange('custom')}
          >
            Sélection personnalisée
          </RadioCard>
        </div>
      </div>

      {scope === 'custom' && (
        <div className="max-h-48 overflow-y-auto bg-neutral-950 rounded-xl border border-neutral-800 p-2 space-y-1">
          {Object.values(diagrams).map((d) => {
            const isChecked = selectedIds.has(d.id);
            return (
              <div
                key={d.id}
                onClick={() => onToggleDiagram(d.id)}
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
  );
}
