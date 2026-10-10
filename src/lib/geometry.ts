import type { BottomIndicatorType, Diagram, FreeText, StyleSettings } from './types';

export const OFFSET_X = 65;
export const OFFSET_Y = 120;
/** Espacement des cordes par défaut (7 frettes et moins). */
export const STRING_GAP = 70;
/** Écart entre frettes « standard » (plafond au-delà duquel les cases rétrécissent). */
export const FRET_GAP = 75;

/** Longueur max du bloc frettes : au-delà, les cases se rétrécissent. */
export const MAX_BOARD = 640;

/** Base du resserrement des cordes : espacement = max(plancher, min(70, 560 / frettes)). */
const STRING_GAP_BASE = 560;
/** Plancher de l'espacement des cordes (beaucoup de frettes). */
export const STRING_GAP_MIN = 40;

export const MAX_FRET = 24;
export const MIN_FRETS = 1;
export const MAX_FRETS = 12;

/** Titre du diagramme : taille bornée puis passage sur plusieurs lignes. */
const TITLE_SIZE_MAX = 24;
const TITLE_SIZE_MIN = 16;
const TITLE_LEAD_RATIO = 1.35;
const TITLE_MARGIN = 24;
/** Centre vertical de la première ligne de titre (repère écran). */
export const TITLE_FIRST_CY = 45;
/** Bas du bloc titre → indicateurs sillet. */
const TITLE_TO_NUT = 34;
/** Indicateurs sillet → sillet (début de la table). */
const NUT_TO_BOARD = 25;
/** Bande réservée aux indicateurs dessus le sillet (0 si désactivés). */
export const NUT_LABEL_BAND = 46;
/** Distance (logique) entre le centre des labels dessus sillet et celui des ○/×. */
export const NUT_LABEL_GAP = 34;
/** Réserve sous les cordes en mode horizontal (numéros de cases). */
const HORIZONTAL_BOTTOM = 77;
/** Distance entre les numéros de cases et la table (axe logique X, mode vertical). */
export const FRET_NUM_GAP = 40;

export const totalFretsFor = (indicator: BottomIndicatorType): number =>
  indicator === 'none' ? 7 : 6;

/** Réduit la taille de police pour que le texte tienne dans `maxWidth`. */
export const fitFontSize = (
  text: string,
  maxWidth: number,
  maxSize = 32,
  minSize = 10,
): number => {
  const estimatedWidth = text.length * maxSize * 0.6;
  if (estimatedWidth <= maxWidth) return maxSize;
  return Math.max(minSize, Math.floor((maxWidth / estimatedWidth) * maxSize));
};

/** Écart entre frettes pour `frets` cases : rétrécit quand la table dépasse MAX_BOARD. */
export const fretGapFor = (frets: number): number =>
  Math.max(30, Math.min(FRET_GAP, MAX_BOARD / Math.max(1, frets)));

/** Espacement des cordes pour `frets` cases : se resserre quand les frettes augmentent. */
export const stringGapFor = (frets: number): number =>
  Math.max(
    STRING_GAP_MIN,
    Math.round(Math.min(STRING_GAP, STRING_GAP_BASE / Math.max(1, frets))),
  );

/** Échelle des pastilles/labels : proportionnelle à l'écart des cases. */
export const dotScale = (gap: number): number => Math.min(1, gap / FRET_GAP);

let measureCtx: CanvasRenderingContext2D | null | undefined;

/** Largeur réelle d'un texte (mesure navigateur, estimation en secours). */
export const measureTextWidth = (
  text: string,
  size: number,
  fontFamily = 'sans-serif',
  bold = true,
): number => {
  if (measureCtx === undefined) {
    measureCtx = document.createElement('canvas').getContext('2d');
  }
  if (!measureCtx) return text.length * size * 0.55;
  measureCtx.font = `${bold ? 'bold ' : ''}${size}px ${fontFamily}`;
  return measureCtx.measureText(text).width;
};

/** Largeur d'un titre (bold sans-serif) pour le word-wrap. */
const textWidth = (text: string, size: number): number =>
  measureTextWidth(text, size, 'sans-serif', true);

/** Découpe `text` en lignes qui tiennent dans `maxWidth` (coupes sur les espaces). */
export const wrapText = (text: string, maxWidth: number, size: number): string[] => {
  if (!text) return [''];
  if (maxWidth <= 0) return [text];

  const lines: string[] = [];
  let current = '';
  for (const word of text.split(/\s+/)) {
    const trial = current ? `${current} ${word}` : word;
    if (textWidth(trial, size) <= maxWidth) {
      current = trial;
      continue;
    }
    if (current) {
      lines.push(current);
      current = '';
    }
    // Mot seul plus long que la ligne : on le coupe caractère par caractère.
    if (textWidth(word, size) > maxWidth) {
      let chunk = '';
      for (const ch of word) {
        if (chunk && textWidth(chunk + ch, size) > maxWidth) {
          lines.push(chunk);
          chunk = ch;
        } else {
          chunk += ch;
        }
      }
      current = chunk;
    } else {
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [''];
};

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
  const titleBottom =
    TITLE_FIRST_CY + (titleLines.length - 1) * titleLead + titleLead / 2;

  // Vertical : la table descend pour laisser passer le titre (+ la rangée de labels).
  // Horizontal : les cordes (axe écran Y) descendent sous le bloc titre
  // avec le même écart que le vertical, pour que titre et pastilles ne se touchent pas.
  const offsetY = horizontal
    ? hMargin
    : titleBottom + TITLE_TO_NUT + nutBand + NUT_TO_BOARD;
  const offsetX = horizontal
    ? titleBottom + TITLE_TO_NUT + nutBand + NUT_TO_BOARD
    : OFFSET_X;
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

/** Style par défaut des textes libres. */
export const DEFAULT_TEXT_SIZE = 26;
export const MIN_TEXT_SIZE = 12;

export interface FreeTextMetrics {
  /** Taille de police finale (adaptée à la largeur si non imposée). */
  size: number;
  /** Largeur mesurée du texte (px écran). */
  width: number;
  /** Hauteur de ligne approximative (px écran). */
  height: number;
  fontFamily: string;
  bold: boolean;
  color: string;
}

/**
 * Métriques d'un texte libre : source unique pour le rendu canvas,
 * l'export SVG et le hit-test (sélection/drag).
 */
export const freeTextMetrics = (
  t: FreeText,
  canvasW: number,
  horizontal: boolean,
): FreeTextMetrics => {
  const sx = horizontal ? t.y : t.x;
  const maxW = Math.max(40, 2 * Math.min(sx, canvasW - sx) - 16);
  const size = t.fontSize ?? fitFontSize(t.text, maxW, DEFAULT_TEXT_SIZE, MIN_TEXT_SIZE);
  const fontFamily = t.fontFamily ?? 'sans-serif';
  const bold = t.bold !== false;
  const width = measureTextWidth(t.text, size, fontFamily, bold);
  return {
    size,
    width,
    height: size * 1.2,
    fontFamily,
    bold,
    color: t.color ?? '#ffffff',
  };
};

/** Id du texte situé sous le point logique (dernier rendu = dessus), ou null. */
export const hitTestText = (
  texts: FreeText[],
  x: number,
  y: number,
  canvasW: number,
  horizontal: boolean,
): string | null => {
  for (let i = texts.length - 1; i >= 0; i--) {
    const t = texts[i];
    const m = freeTextMetrics(t, canvasW, horizontal);
    if (Math.abs(x - t.x) <= m.width / 2 + 6 && Math.abs(y - t.y) <= m.height / 2 + 6) {
      return t.id;
    }
  }
  return null;
};
