import { diagramLayout, dotScale } from '../../geometry';
import { tuningOffsets } from '../../theory';
import type { Diagram, StyleSettings } from '../../types';
import { DOT_R_BASE } from '../tokens';
import type { Primitive, RenderContext } from '../types';
import { buildFretNumbers, buildFrets, buildNut, buildStrings } from './board';
import { buildBottomLabels, buildFreeTexts, buildNutLabels, buildTitle } from './labels';
import { buildNotes, buildNutIndicators, buildRoot } from './markers';

/**
 * Projection logique (repère vertical) → écran. Le mode horizontal
 * transpose les deux axes ; utilisé par le rendu ET l'overlay de sélection.
 */
export const project = (horizontal: boolean) => ({
  X: (lx: number, ly: number) => (horizontal ? ly : lx),
  Y: (lx: number, ly: number) => (horizontal ? lx : ly),
});

const createContext = (diagram: Diagram, style: StyleSettings): RenderContext => {
  const layout = diagramLayout(diagram, style);
  const { gap, stringGap, horizontal, offsetX } = layout;
  const scale = dotScale(gap);
  const { X, Y } = project(horizontal);
  return {
    diagram,
    style,
    layout,
    startFret: diagram.startFret || 1,
    offsets: tuningOffsets(diagram.tuning),
    scale,
    dotR: DOT_R_BASE * scale,
    X,
    Y,
    /** Position (axe logique X) d'une corde : inversée en horizontal (corde 6 grave en bas). */
    stringX: (s: number) => offsetX + (horizontal ? 5 - s : s) * stringGap,
  };
};

/**
 * Construit la liste ordonnée (z-order) des primitives d'un diagramme.
 * Source unique de vérité : l'écran (DiagramCanvas) et l'export SVG
 * (createSVGString) consomment exactement cette même liste.
 */
export const buildPrimitives = (diagram: Diagram, style: StyleSettings): Primitive[] => {
  const ctx = createContext(diagram, style);
  return [
    ...buildTitle(ctx), // 1. Titre multi-lignes
    ...buildNutLabels(ctx), // 2. Labels dessus le sillet
    ...buildNutIndicators(ctx), // 3. Indicateurs ○/×/R
    ...buildStrings(ctx), // 4. Cordes
    ...buildFrets(ctx), // 5. Frettes
    ...buildNut(ctx), // 6. Sillet
    ...buildFretNumbers(ctx), // 7. Numéros de cases
    ...buildRoot(ctx), // 8. Racine frettée
    ...buildNotes(ctx), // 9. Notes frettées
    ...buildFreeTexts(ctx), // 10. Textes libres
    ...buildBottomLabels(ctx), // 11. Labels sous la touche
  ];
};
