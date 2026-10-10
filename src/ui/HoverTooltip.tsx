import { useChordsStore } from '../lib/store/chordsStore';

export interface HoverPoint {
  x: number;
  y: number;
}

interface HoverTooltipProps {
  /** Coordonnées écran du pointeur (clientX / clientY). */
  pos: HoverPoint | null;
}

/** Libellé FR d'une case survolée : « Corde X · Case Y » (Sillet si case 0). */
export const formatHoverCell = (cell: { string: number; fret: number }): string =>
  `Corde ${6 - cell.string} · ${cell.fret > 0 ? `Case ${cell.fret}` : 'Sillet'}`;

/** Infobulle fixe affichée au survol d'une case du diagramme (sans dépendance externe). */
export default function HoverTooltip({ pos }: HoverTooltipProps) {
  const cell = useChordsStore((s) => s.hoverCell);
  if (!cell || !pos) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none px-2 py-1 bg-neutral-950/95 border border-neutral-700 text-[11px] font-semibold tracking-wide text-gold shadow-lg whitespace-nowrap"
      style={{
        left: Math.min(pos.x + 14, window.innerWidth - 150),
        top: Math.min(pos.y + 18, window.innerHeight - 44),
      }}
    >
      {formatHoverCell(cell)}
    </div>
  );
}
