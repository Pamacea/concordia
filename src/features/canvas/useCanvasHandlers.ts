import { useRef, type RefObject } from 'react';
import { diagramLayout } from '../../lib/geometry';
import { useChordsStore } from '../../lib/store/chordsStore';
import { stringIndexAt, toCanvasPoint } from './canvasCoords';
import { startTextDrag } from './textDrag';
import { handleToolClick } from './toolClicks';

/** Gère les clics (gauche/droit) et le drag des textes sur le diagramme. */
export function useCanvasHandlers(svgRef: RefObject<SVGSVGElement | null>) {
  /** Vrai si le dernier pointer-down a déplacé un texte (le clic suivant est ignoré). */
  const movedRef = useRef(false);

  /** Sélectionne un texte au pointeur et lance son drag (outils texte et pointeur). */
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    startTextDrag(e, svgRef, movedRef);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    handleToolClick(e, svgRef, movedRef);
  };

  /** Clic droit : racine au sillet, sinon racine + nettoyage de la case. */
  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    const { activeDiagramId, diagrams, style, updateActiveDiagram } = useChordsStore.getState();
    const diagram = activeDiagramId ? diagrams[activeDiagramId] : null;
    if (!diagram) return;

    const layout = diagramLayout(diagram, style);
    const point = toCanvasPoint(e, svgRef, layout.width, layout.height, layout.horizontal);
    if (!point) return;
    const { x, y } = point;

    if (y >= layout.nutZone - 20 && y < layout.nutZone + 20) {
      const stringIdx = stringIndexAt(x, layout);
      if (stringIdx >= 0 && stringIdx <= 5) {
        updateActiveDiagram((d) => ({
          ...d,
          root: { s: stringIdx, f: -1 },
          fingerings: { ...d.fingerings, [stringIdx]: '0' },
        }));
      }
      return;
    }

    const maxFretsLimit = layout.frets;
    const gridY = y - layout.offsetY;
    const s = stringIndexAt(x, layout);
    const f = Math.floor(gridY / layout.gap);

    const validS = Math.max(0, Math.min(5, s));
    const validF = Math.max(0, Math.min(maxFretsLimit - 1, f));

    if (gridY < 0) return;

    updateActiveDiagram((d) => {
      if (d.root !== null && d.root.s === validS && d.root.f === validF) {
        return { ...d, root: null };
      }
      const filteredNotes = d.notes.filter((n) => !(n.s === validS && n.f === validF));
      return { ...d, root: { s: validS, f: validF }, notes: filteredNotes };
    });
  };

  return { handleCanvasClick, handleCanvasContextMenu, handleCanvasPointerDown };
}
