import type { RefObject } from 'react';
import type { DiagramLayout } from '../../lib/geometry';

/** Point en coordonnées logiques du diagramme (repère vertical). */
export interface CanvasPoint {
  x: number;
  y: number;
}

/**
 * Index de corde depuis la position logique X.
 * En mode horizontal, l'ordre des cordes est inversé à l'écran
 * (corde 6 grave en bas) : on inverse donc l'index retourné.
 */
export const stringIndexAt = (x: number, layout: DiagramLayout): number => {
  const raw = Math.round((x - layout.offsetX) / layout.stringGap);
  return layout.horizontal ? 5 - raw : raw;
};

/**
 * Convertit des coordonnées écran en coordonnées logiques du diagramme.
 * En mode horizontal, les axes sont transposés pour que toute la
 * logique (sillet, grille, texte) reste écrite en repère vertical.
 */
export const toCanvasPoint = (
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
