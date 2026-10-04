import { useRef, type RefObject } from 'react';
import {
  STRING_GAP,
  diagramLayout,
  hitTestText,
  type DiagramLayout,
} from '../../lib/geometry';
import { generateId } from '../../lib/id';
import { useChordsStore } from '../../lib/store/chordsStore';

interface CanvasPoint {
  x: number;
  y: number;
}

/**
 * Index de corde depuis la position logique X.
 * En mode horizontal, l'ordre des cordes est inversé à l'écran
 * (corde 6 grave en bas) : on inverse donc l'index retourné.
 */
const stringIndexAt = (x: number, layout: DiagramLayout): number => {
  const raw = Math.round((x - layout.offsetX) / STRING_GAP);
  return layout.horizontal ? 5 - raw : raw;
};

/**
 * Convertit des coordonnées écran en coordonnées logiques du diagramme.
 * En mode horizontal, les axes sont transposés pour que toute la
 * logique (sillet, grille, texte) reste écrite en repère vertical.
 */
const toCanvasPoint = (
  e: { clientX: number; clientY: number },
  svgRef: RefObject<SVGSVGElement | null>,
  width: number,
  height: number,
  horizontal: boolean,
): CanvasPoint | null => {
  const svg = svgRef.current;
  if (!svg) return null;
  const rect = svg.getBoundingClientRect();
  const px = (e.clientX - rect.left) * (width / rect.width);
  const py = (e.clientY - rect.top) * (height / rect.height);
  return horizontal ? { x: py, y: px } : { x: px, y: py };
};

/** Gère les clics (gauche/droit) et le drag des textes sur le diagramme. */
export function useCanvasHandlers(svgRef: RefObject<SVGSVGElement | null>) {
  /** Vrai si le dernier pointer-down a déplacé un texte (le clic suivant est ignoré). */
  const movedRef = useRef(false);

  /** Sélectionne un texte au pointeur et lance son drag (outils texte et pointeur). */
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
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

    const tId = hitTestText(
      diagram.texts,
      point.x,
      point.y,
      layout.width,
      layout.horizontal,
    );
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
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
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
  };

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
