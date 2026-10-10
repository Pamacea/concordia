import { diagramLayout } from '../../lib/geometry';
import { buildPrimitives } from '../../lib/render/buildPrimitives';
import { serializeSVG } from '../../lib/render/serializeSVG';
import type { Diagram, StyleSettings } from '../../lib/types';

/** Génère la représentation SVG autonome d'un diagramme (pour l'export). */
export const createSVGString = (diag: Diagram, style: StyleSettings): string => {
  const { width, height } = diagramLayout(diag, style);
  const primitives = buildPrimitives(diag, style);
  return serializeSVG(primitives, { width, height }, style.diagramBgColor);
};
