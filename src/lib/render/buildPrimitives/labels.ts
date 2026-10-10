import { TITLE_FIRST_CY, freeTextMetrics } from '../../geometry';
import { bottomLabel, nutLabel } from '../../labels';
import { C_GOLD, C_WHITE, FONT_SANS, FS_BOTTOM, FS_NUT_LABEL } from '../tokens';
import type { Primitive, RenderContext } from '../types';

/** Titre multi-lignes : le canvas s'allonge pour le contenir. */
export const buildTitle = ({ layout }: RenderContext): Primitive[] =>
  layout.titleLines.map((line, i) => ({
    kind: 'text',
    key: `title-${i}`,
    x: layout.width / 2,
    y: TITLE_FIRST_CY + i * layout.titleLead,
    text: line,
    fill: C_WHITE,
    fontSize: layout.titleSize,
    fontWeight: 'bold',
    fontFamily: FONT_SANS,
    textAnchor: 'middle',
    dominantBaseline: 'central',
  }));

/** Labels dessus le sillet : note de la corde à vide (rangée au-dessus des ○/×). */
export const buildNutLabels = ({ diagram, layout, X, Y, stringX }: RenderContext): Primitive[] => {
  if (!layout.hasNutLabels) return [];
  const { nutLabelY } = layout;
  const prims: Primitive[] = [];
  for (let i = 0; i < 6; i++) {
    const label = nutLabel(diagram, i);
    if (!label) continue;
    prims.push({
      kind: 'text',
      key: `nut-label-${i}`,
      x: X(stringX(i), nutLabelY),
      y: Y(stringX(i), nutLabelY),
      text: label,
      fill: C_GOLD,
      fontSize: FS_NUT_LABEL,
      fontWeight: 'bold',
      fontFamily: FONT_SANS,
      textAnchor: 'middle',
      dominantBaseline: 'central',
    });
  }
  return prims;
};

/** Textes libres : position/métriques via freeTextMetrics (source unique). */
export const buildFreeTexts = ({ diagram, layout, X, Y }: RenderContext): Primitive[] =>
  diagram.texts.map((t) => {
    const m = freeTextMetrics(t, layout.width, layout.horizontal);
    const key = `text-${t.id}`;
    return {
      kind: 'group',
      key,
      children: [
        {
          kind: 'text',
          key: `${key}-label`,
          x: X(t.x, t.y),
          y: Y(t.x, t.y),
          text: t.text,
          fill: m.color,
          fontSize: m.size,
          fontWeight: m.bold ? 'bold' : 'normal',
          fontFamily: m.fontFamily,
          textAnchor: 'middle',
          dominantBaseline: 'central',
        },
      ],
    };
  });

/** Indicateurs sous la table (doigté, notes ou intervalles selon le style). */
export const buildBottomLabels = ({
  diagram,
  style,
  layout,
  startFret,
  stringX,
}: RenderContext): Primitive[] => {
  if (!layout.hasBottom) return [];
  const { horizontal, bottomOffset } = layout;
  const prims: Primitive[] = [];
  for (let sIdx = 0; sIdx < 6; sIdx++) {
    const label = bottomLabel(diagram, style, sIdx, startFret);
    if (!label) continue;
    prims.push({
      kind: 'text',
      key: `bottom-ind-${sIdx}`,
      x: horizontal ? bottomOffset : stringX(sIdx),
      y: horizontal ? stringX(sIdx) : bottomOffset,
      text: label,
      fill: C_GOLD,
      fontSize: FS_BOTTOM,
      fontWeight: 'bold',
      fontFamily: FONT_SANS,
      textAnchor: 'middle',
      dominantBaseline: 'central',
    });
  }
  return prims;
};
