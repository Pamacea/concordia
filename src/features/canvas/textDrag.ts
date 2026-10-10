import type { RefObject } from 'react';
import { diagramLayout, hitTestText } from '../../lib/geometry';
import { useChordsStore } from '../../lib/store/chordsStore';
import { toCanvasPoint } from './canvasCoords';

/**
 * Sélectionne un texte au pointeur et lance son drag (outils texte et pointeur).
 * `movedRef` passe à vrai dès qu'un drag a réellement bougé : le clic suivant
 * est alors ignoré par `handleToolClick`.
 */
export function startTextDrag(
  e: React.PointerEvent,
  svgRef: RefObject<SVGSVGElement | null>,
  movedRef: RefObject<boolean>,
): void {
  if (e.button !== 0) return;
  movedRef.current = false;

  const { activeDiagramId, diagrams, activeTool, style, selectText, moveText } =
    useChordsStore.getState();
  const diagram = activeDiagramId ? diagrams[activeDiagramId] : null;
  if (!diagram) return;
  if (activeTool !== 'text' && activeTool !== 'pointer') return;

  const layout = diagramLayout(diagram, style);
  const point = toCanvasPoint(e, svgRef, layout.width, layout.height, layout.horizontal);
  if (!point) return;

  const tId = hitTestText(diagram.texts, point.x, point.y, layout.width, layout.horizontal);
  if (!tId) return;

  selectText(tId);
  const target = diagram.texts.find((t) => t.id === tId);
  if (!target) return;

  const grabX = target.x - point.x;
  const grabY = target.y - point.y;
  const startX = point.x;
  const startY = point.y;
  let dragging = false;

  // Bornes logiques : en horizontal, les axes logiques sont transposés.
  const maxX = layout.horizontal ? layout.height : layout.width;
  const maxY = layout.horizontal ? layout.width : layout.height;

  const onMove = (ev: PointerEvent) => {
    const p = toCanvasPoint(ev, svgRef, layout.width, layout.height, layout.horizontal);
    if (!p) return;
    if (!dragging && Math.hypot(p.x - startX, p.y - startY) < 3) return;
    dragging = true;
    movedRef.current = true;
    moveText(
      tId,
      Math.max(8, Math.min(maxX - 8, p.x + grabX)),
      Math.max(8, Math.min(maxY - 8, p.y + grabY)),
    );
  };
  const onUp = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
}
