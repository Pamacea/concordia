import { FRET_NUM_GAP } from '../../geometry';
import { C_WHITE, FRET_NUM_BOTTOM_GAP, FONT_SANS, STRING_TAPER } from '../tokens';
import type { Primitive, RenderContext } from '../types';

/** Cordes : épaisseur dégressive de la 6e (i=0) à la 1re. */
export const buildStrings = ({ layout, style, X, Y, stringX }: RenderContext): Primitive[] => {
  const { frets, gap, offsetY } = layout;
  return Array.from({ length: 6 }, (_, i) => ({
    kind: 'line',
    key: `string-${i}`,
    x1: X(stringX(i), offsetY),
    y1: Y(stringX(i), offsetY),
    x2: X(stringX(i), offsetY + frets * gap),
    y2: Y(stringX(i), offsetY + frets * gap),
    stroke: C_WHITE,
    strokeWidth: Math.max(1, style.stringThicknessBase * (1 - i * STRING_TAPER)),
    opacity: style.stringOpacity / 100,
  }));
};

/** Frettes : frettes+1 traits perpendiculaires aux cordes. */
export const buildFrets = ({ layout, style, X, Y }: RenderContext): Primitive[] => {
  const { frets, gap, offsetX, offsetY, stringGap } = layout;
  return Array.from({ length: frets + 1 }, (_, i) => ({
    kind: 'line',
    key: `fret-${i}`,
    x1: X(offsetX, offsetY + i * gap),
    y1: Y(offsetX, offsetY + i * gap),
    x2: X(offsetX + 5 * stringGap, offsetY + i * gap),
    y2: Y(offsetX + 5 * stringGap, offsetY + i * gap),
    stroke: C_WHITE,
    strokeWidth: style.fretThickness,
    opacity: style.fretOpacity / 100,
  }));
};

/** Sillet : trait plus épais au-dessus de la première case. */
export const buildNut = ({ layout, style, startFret, X, Y }: RenderContext): Primitive[] => {
  const { offsetX, offsetY, stringGap } = layout;
  const halfBase = style.stringThicknessBase / 2;
  return [
    {
      kind: 'line',
      key: 'nut',
      x1: X(offsetX - halfBase, offsetY),
      y1: Y(offsetX - halfBase, offsetY),
      x2: X(offsetX + 5 * stringGap + halfBase, offsetY),
      y2: Y(offsetX + 5 * stringGap + halfBase, offsetY),
      stroke: style.nutColor,
      strokeWidth: startFret === 1 ? style.nutThickness : Math.max(2, style.nutThickness * 0.4),
      opacity: style.nutOpacity / 100,
    },
  ];
};

/** Numéros de cases : au bas du canvas en horizontal, à gauche de la table en vertical. */
export const buildFretNumbers = ({ layout, style, startFret }: RenderContext): Primitive[] => {
  if (!style.showFretNumbers) return [];
  const { frets, gap, horizontal, offsetX, offsetY, height: canvasH } = layout;
  const children: Primitive[] = Array.from({ length: frets }, (_, i) => ({
    kind: 'text',
    key: `fret-num-${i}`,
    x: horizontal ? offsetY + i * gap + gap / 2 : offsetX - FRET_NUM_GAP,
    y: horizontal ? canvasH - FRET_NUM_BOTTOM_GAP : offsetY + i * gap + gap / 2,
    text: String(startFret + i),
    fill: style.fretNumberColor,
    fontSize: style.fretNumberSize,
    fontWeight: 'bold',
    fontFamily: FONT_SANS,
    textAnchor: 'middle',
    dominantBaseline: 'central',
  }));
  return [{ kind: 'group', key: 'fret-nums', children }];
};
