import type { BottomIndicatorType, Diagram, StyleSettings } from '../types';
import {
  FRET_GAP,
  HORIZONTAL_BOTTOM,
  MAX_BOARD,
  MAX_FRETS,
  NUT_LABEL_BAND,
  NUT_LABEL_GAP,
  NUT_TO_BOARD,
  OFFSET_X,
  OFFSET_Y,
  STRING_GAP,
  STRING_GAP_BASE,
  STRING_GAP_MIN,
  TITLE_FIRST_CY,
  TITLE_LEAD_RATIO,
  TITLE_MARGIN,
  TITLE_SIZE_MAX,
  TITLE_SIZE_MIN,
  TITLE_TO_NUT,
} from './constants';
import { fitFontSize, wrapText } from './text';

export const totalFretsFor = (indicator: BottomIndicatorType): number =>
  indicator === 'none' ? 7 : 6;

/** Écart entre frettes pour `frets` cases : rétrécit quand la table dépasse MAX_BOARD. */
export const fretGapFor = (frets: number): number =>
  Math.max(30, Math.min(FRET_GAP, MAX_BOARD / Math.max(1, frets)));

/** Espacement des cordes pour `frets` cases : se resserre quand les frettes augmentent. */
export const stringGapFor = (frets: number): number =>
  Math.max(STRING_GAP_MIN, Math.round(Math.min(STRING_GAP, STRING_GAP_BASE / Math.max(1, frets))));

/** Échelle des pastilles/labels : proportionnelle à l'écart des cases. */
export const dotScale = (gap: number): number => Math.min(1, gap / FRET_GAP);

export interface DiagramLayout {
  /** Nombre de frettes affichées. */
  frets: number;
  /** Écart vertical entre frettes (cases rétrécies au besoin). */
  gap: number;
  /** Écart entre cordes (se resserre quand le nombre de frettes augmente). */
  stringGap: number;
  horizontal: boolean;
  hasBottom: boolean;
  /** Début de la table sur l'axe logique X (65, + décalage titre en horizontal). */
  offsetX: number;
  /** Début de la table sur l'axe logique Y (sillet) : grandit avec le titre en vertical. */
  offsetY: number;
  /** Centre des indicateurs sillet (○/×/R) sur l'axe logique Y (= offsetY - 25). */
  nutZone: number;
  titleSize: number;
  titleLead: number;
  titleLines: string[];
  width: number;
  height: number;
  /** Position des indicateurs sous la touche (axe logique Y). */
  bottomOffset: number;
  /** Vrai si une rangée de labels doit être dessinée au-dessus des ○/×. */
  hasNutLabels: boolean;
  /** Centre de cette rangée (axe logique Y) ; non pertinent si inactive. */
  nutLabelY: number;
}

/**
 * Layout complet d'un diagramme : titre multi-lignes, écart de cases dynamique
 * et dimensions du canvas. Source unique pour le rendu, l'export et les clics.
 */
export const diagramLayout = (diagram: Diagram, style: StyleSettings): DiagramLayout => {
  const frets = diagramFrets(diagram, style);
  const horizontal = (diagram.orientation ?? 'vertical') === 'horizontal';
  const hasBottom = style.bottomIndicatorType !== 'none';
  const hasNutLabels = (diagram.nutIndicator ?? 'none') !== 'none';
  const nutBand = hasNutLabels ? NUT_LABEL_BAND : 0;
  const gap = fretGapFor(frets);
  const stringGap = stringGapFor(frets);
  const reserve = hasBottom ? 110 : 35;

  // Horizontal : marge latérale unique = moyenne des marges gauche/droite,
  // pour que la grille soit parfaitement centrée. `nutBand` élargit les deux
  // côtés pour dégager la rangée de labels au-delà du bord gauche du canvas.
  const hMargin = (OFFSET_Y + reserve + nutBand) / 2;
  const width = horizontal ? 2 * hMargin + frets * gap : 2 * OFFSET_X + 5 * stringGap;

  // Largeur disponible pour le titre (indépendante du titre lui-même : pas de circularité).
  const titleWidth = width - TITLE_MARGIN;
  const titleSize = fitFontSize(diagram.name, titleWidth, TITLE_SIZE_MAX, TITLE_SIZE_MIN);
  const titleLead = titleSize * TITLE_LEAD_RATIO;
  const titleLines = wrapText(diagram.name, titleWidth, titleSize);
  const titleBottom = TITLE_FIRST_CY + (titleLines.length - 1) * titleLead + titleLead / 2;

  // Vertical : la table descend pour laisser passer le titre (+ la rangée de labels).
  // Horizontal : les cordes (axe écran Y) descendent sous le bloc titre
  // avec le même écart que le vertical, pour que titre et pastilles ne se touchent pas.
  const offsetY = horizontal ? hMargin : titleBottom + TITLE_TO_NUT + nutBand + NUT_TO_BOARD;
  const offsetX = horizontal ? titleBottom + TITLE_TO_NUT + nutBand + NUT_TO_BOARD : OFFSET_X;
  const nutZone = offsetY - NUT_TO_BOARD;
  const nutLabelY = nutZone - NUT_LABEL_GAP;

  const height = horizontal
    ? offsetX + 5 * stringGap + HORIZONTAL_BOTTOM
    : offsetY + frets * gap + reserve;
  const bottomOffset = offsetY + frets * gap + 32;

  return {
    frets,
    gap,
    stringGap,
    horizontal,
    hasBottom,
    offsetX,
    offsetY,
    nutZone,
    titleSize,
    titleLead,
    titleLines,
    width,
    height,
    bottomOffset,
    hasNutLabels,
    nutLabelY,
  };
};

/** Nombre de frettes affichées : override par diagramme (borné à MAX_FRETS) sinon déduit du style. */
export const diagramFrets = (diagram: Diagram, style: StyleSettings): number =>
  Math.min(MAX_FRETS, diagram.fretCount ?? totalFretsFor(style.bottomIndicatorType));

/** Dimensions du canvas SVG d'un diagramme. */
export const diagramCanvasSize = (
  diagram: Diagram,
  style: StyleSettings,
): { width: number; height: number } => {
  const layout = diagramLayout(diagram, style);
  return { width: layout.width, height: layout.height };
};
