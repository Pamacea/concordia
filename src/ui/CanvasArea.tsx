import { useRef } from 'react';
import { Circle, Eraser, MousePointer2, Music, Type } from 'lucide-react';
import { useChordsStore } from '../lib/store/chordsStore';
import DiagramCanvas from './DiagramCanvas';
import TextToolPanel from './TextToolPanel';
import ToolButton from './ToolButton';

export default function CanvasArea() {
  const activeDiagramId = useChordsStore((s) => s.activeDiagramId);
  const diagrams = useChordsStore((s) => s.diagrams);
  const activeTool = useChordsStore((s) => s.activeTool);
  const setActiveTool = useChordsStore((s) => s.setActiveTool);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const diagram = activeDiagramId ? (diagrams[activeDiagramId] ?? null) : null;

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-neutral-900 flex flex-col items-center justify-center p-4 md:p-6 pb-24 overflow-auto relative"
    >
      {diagram ? (
        <div className="relative shadow-2xl border border-neutral-800 overflow-hidden max-w-full">
          <DiagramCanvas svgRef={svgRef} diagram={diagram} />
        </div>
      ) : (
        <div className="w-[480px] max-w-full h-[680px] flex flex-col items-center justify-center bg-neutral-950 text-neutral-500 border border-neutral-800 p-6 text-center">
          <Music size={48} className="mb-2 opacity-40" />
          <p>Sélectionnez ou créez un accord pour commencer</p>
        </div>
      )}

      {diagram && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-neutral-950/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-neutral-700/80 shadow-2xl">
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
          <div className="w-px h-6 bg-neutral-800 mx-1"></div>
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
    </div>
  );
}
