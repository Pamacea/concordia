import { useRef, useState, type RefObject } from 'react';
import { Circle, Eraser, MousePointer2, Music, Type } from 'lucide-react';
import { stringIndexAt, toCanvasPoint } from '../features/canvas/canvasCoords';
import { diagramLayout } from '../lib/geometry';
import { useChordsStore } from '../lib/store/chordsStore';
import type { Diagram, StyleSettings } from '../lib/types';
import DiagramCanvas from './DiagramCanvas';
import HoverTooltip, { type HoverPoint } from './HoverTooltip';
import StatusBar from './StatusBar';
import TextToolPanel from './TextToolPanel';
import ToolButton from './ToolButton';

/** Index de corde 0-5 + case absolue (0 = sillet / corde à vide). */
interface HoverCell {
  string: number;
  fret: number;
}

/** Case sous le pointeur, ou null quand le pointeur sort de la grille. */
const cellAtPointer = (
  e: { clientX: number; clientY: number },
  svgRef: RefObject<SVGSVGElement | null>,
  diagram: Diagram,
  style: StyleSettings,
): HoverCell | null => {
  const layout = diagramLayout(diagram, style);
  const point = toCanvasPoint(e, svgRef, layout.width, layout.height, layout.horizontal);
  if (!point) return null;

  const s = stringIndexAt(point.x, layout);
  if (s < 0 || s > 5) return null;

  const gridY = point.y - layout.offsetY;
  if (gridY < 0) {
    // Bande du sillet : corde à vide (case 0) uniquement autour des ○/×.
    return Math.abs(point.y - layout.nutZone) <= 24 ? { string: s, fret: 0 } : null;
  }

  const f = Math.floor(gridY / layout.gap);
  if (f < 0 || f >= layout.frets) return null;
  return { string: s, fret: diagram.startFret + f };
};

export default function CanvasArea() {
  const activeDiagramId = useChordsStore((s) => s.activeDiagramId);
  const diagrams = useChordsStore((s) => s.diagrams);
  const activeTool = useChordsStore((s) => s.activeTool);
  const setActiveTool = useChordsStore((s) => s.setActiveTool);
  const style = useChordsStore((s) => s.style);
  const setHoverCell = useChordsStore((s) => s.setHoverCell);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [pointer, setPointer] = useState<HoverPoint | null>(null);
  const diagram = activeDiagramId ? (diagrams[activeDiagramId] ?? null) : null;

  /** Suit le pointeur : alimente `hoverCell` (store) et la position de l'infobulle. */
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    setPointer({ x: e.clientX, y: e.clientY });
    setHoverCell(diagram ? cellAtPointer(e, svgRef, diagram, style) : null);
  };

  const handlePointerLeave = () => {
    setPointer(null);
    setHoverCell(null);
  };

  /** Clic sur le canvas = zone de focus clavier (cycle Tab), sans voler les champs. */
  const handleZonePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target;
    if (target instanceof Element && target.closest('input, textarea, select, button, a')) return;
    e.currentTarget.focus({ preventScroll: true });
  };

  return (
    <div
      data-focus-zone="canvas"
      tabIndex={0}
      onPointerDown={handleZonePointerDown}
      className="flex-1 flex flex-col min-w-0 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
    >
      <div
        ref={containerRef}
        className="flex-1 bg-neutral-900 flex flex-col items-center justify-center p-4 md:p-6 overflow-auto relative"
      >
        {diagram ? (
          <div
            className="relative shadow-2xl border border-neutral-800 overflow-hidden"
            style={{ maxWidth: '100%' }}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            <DiagramCanvas svgRef={svgRef} diagram={diagram} />
          </div>
        ) : (
          <div
            className="w-[480px] h-[680px] flex flex-col items-center justify-center bg-neutral-950 text-neutral-500 border border-neutral-800 p-6 text-center"
            style={{ maxWidth: '100%' }}
          >
            <Music size={48} className="mb-2 opacity-40" />
            <p>Sélectionnez ou créez un accord pour commencer</p>
          </div>
        )}

        {diagram && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2 bg-neutral-950/90 backdrop-blur-md px-2.5 py-4 border border-neutral-700/80 shadow-2xl">
            <ToolButton
              icon={<MousePointer2 size={18} />}
              label="Pointeur"
              shortcutKey="P"
              isActive={activeTool === 'pointer'}
              onClick={() => setActiveTool('pointer')}
            />
            <ToolButton
              icon={<Circle size={18} />}
              label="Note / Fondamentale"
              shortcutKey="N"
              isActive={activeTool === 'note'}
              onClick={() => setActiveTool('note')}
            />
            <ToolButton
              icon={<Type size={18} />}
              label="Texte Libre"
              shortcutKey="T"
              isActive={activeTool === 'text'}
              onClick={() => setActiveTool('text')}
            />
            <div className="h-px w-6 bg-neutral-800 my-1" />
            <ToolButton
              icon={<Eraser size={18} />}
              label="Gomme"
              shortcutKey="G"
              isActive={activeTool === 'eraser'}
              onClick={() => setActiveTool('eraser')}
            />
          </div>
        )}

        {/* Panneau flottant de l'outil texte (apparaît quand un texte est sélectionné) */}
        <TextToolPanel svgRef={svgRef} containerRef={containerRef} />
        <HoverTooltip pos={pointer} />
      </div>

      <StatusBar />
    </div>
  );
}
