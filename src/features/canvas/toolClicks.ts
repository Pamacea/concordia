import type { RefObject } from 'react';
import { diagramLayout, hitTestText } from '../../lib/geometry';
import { generateId } from '../../lib/id';
import { useChordsStore } from '../../lib/store/chordsStore';
import { stringIndexAt, toCanvasPoint } from './canvasCoords';

/**
 * Clic gauche sur le diagramme : textes, cycle ○/×/vide au sillet,
 * placement/suppression de notes (outil note et gomme).
 * Ignoré si le pointer-down précédent a déplacé un texte (`movedRef`).
 */
export function handleToolClick(
  e: React.MouseEvent,
  svgRef: RefObject<SVGSVGElement | null>,
  movedRef: RefObject<boolean>,
): void {
  if (movedRef.current) {
    movedRef.current = false;
    return;
  }

  const {
    activeDiagramId,
    diagrams,
    activeTool,
    style,
    updateActiveDiagram,
    selectText,
    addText,
    deleteText,
  } = useChordsStore.getState();
  const diagram = activeDiagramId ? diagrams[activeDiagramId] : null;
  if (!diagram) return;

  const layout = diagramLayout(diagram, style);
  const point = toCanvasPoint(e, svgRef, layout.width, layout.height, layout.horizontal);
  if (!point) return;
  const { x, y } = point;

  // Textes libres : priorité sur le sillet/grille (un texte peut les recouvrir).
  if (activeTool === 'text' || activeTool === 'pointer' || activeTool === 'eraser') {
    const tId = hitTestText(diagram.texts, x, y, layout.width, layout.horizontal);
    if (tId) {
      if (activeTool === 'eraser') deleteText(tId);
      else selectText(tId);
      return;
    }
    if (activeTool === 'text') {
      addText(x, y);
      return;
    }
    if (activeTool === 'pointer') selectText(null);
  }

  // Zone sillet : cycle corde à vide → muette → vide
  if (y >= layout.nutZone - 20 && y < layout.nutZone + 20) {
    const stringIdx = stringIndexAt(x, layout);
    if (stringIdx >= 0 && stringIdx <= 5) {
      const current = diagram.fingerings[stringIdx] ?? '';
      let nextState = '0';
      if (current === '0') nextState = 'X';
      else if (current === 'X') nextState = '';
      else nextState = '0';

      updateActiveDiagram((d) => ({
        ...d,
        fingerings: { ...d.fingerings, [stringIdx]: nextState },
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

  if (activeTool === 'note') {
    updateActiveDiagram((d) => {
      const isRoot = d.root !== null && d.root.s === validS && d.root.f === validF;
      const isNoteIndex = d.notes.findIndex((n) => n.s === validS && n.f === validF);

      if (isRoot) return { ...d, root: null };
      if (isNoteIndex !== -1) {
        const newNotes = [...d.notes];
        newNotes.splice(isNoteIndex, 1);
        return { ...d, notes: newNotes };
      }
      if (!d.root) return { ...d, root: { s: validS, f: validF } };
      return { ...d, notes: [...d.notes, { id: generateId(), s: validS, f: validF }] };
    });
  } else if (activeTool === 'eraser') {
    updateActiveDiagram((d) => {
      if (d.root !== null && d.root.s === validS && d.root.f === validF) {
        return { ...d, root: null };
      }
      const noteIndex = d.notes.findIndex((n) => n.s === validS && n.f === validF);
      if (noteIndex !== -1) {
        const newNotes = [...d.notes];
        newNotes.splice(noteIndex, 1);
        return { ...d, notes: newNotes };
      }
      return d;
    });
  }
}
