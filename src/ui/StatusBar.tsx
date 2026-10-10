import { useChordsStore } from '../lib/store/chordsStore';
import type { Tool } from '../lib/types';
import { formatHoverCell } from './HoverTooltip';

const TOOL_LABELS: Record<Tool, string> = {
  pointer: 'Pointeur',
  note: 'Note / Fondamentale',
  text: 'Texte',
  eraser: 'Gomme',
};

/** Séparateur vertical sobre entre les segments de la barre d'état. */
function Separator() {
  return <span className="w-px h-3 bg-neutral-800 shrink-0" aria-hidden="true" />;
}

/** Barre d'état sous le canvas : outil actif, case survolée, accord courant. */
export default function StatusBar() {
  const activeTool = useChordsStore((s) => s.activeTool);
  const hoverCell = useChordsStore((s) => s.hoverCell);
  const activeDiagramId = useChordsStore((s) => s.activeDiagramId);
  const diagrams = useChordsStore((s) => s.diagrams);

  const diagram = activeDiagramId ? (diagrams[activeDiagramId] ?? null) : null;

  return (
    <div className="shrink-0 border-t border-neutral-800 bg-neutral-950/60 text-xs text-neutral-400 flex items-center gap-2.5 px-3 py-1.5">
      <span className="flex items-center gap-1.5 min-w-0">
        <span className="text-neutral-500">Outil</span>
        <b className="font-semibold text-gold truncate">{TOOL_LABELS[activeTool]}</b>
      </span>

      <Separator />

      <span className="flex items-center gap-1.5 min-w-0">
        <span className="text-neutral-500 shrink-0">Survol</span>
        <b className="font-semibold text-neutral-300 truncate">
          {hoverCell ? formatHoverCell(hoverCell) : '—'}
        </b>
      </span>

      <Separator />

      <span className="flex items-center gap-1.5 min-w-0 flex-1">
        <span className="text-neutral-500 shrink-0">Accord</span>
        <b className="font-semibold text-neutral-200 truncate">
          {diagram ? diagram.name : 'Aucun diagramme'}
        </b>
      </span>
    </div>
  );
}
