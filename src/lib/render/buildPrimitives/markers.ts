import { diagramFingering } from '../../fingering';
import { getIntervalInfo } from '../../theory';
import {
  C_GOLD,
  C_RED,
  C_WHITE,
  FONT_SANS,
  FS_NOTE,
  FS_OPEN_IND,
  FS_OPEN_ROOT_LABEL,
  FS_ROOT,
  OPEN_ROOT_R,
} from '../tokens';
import type { Primitive, RenderContext, TextP } from '../types';

/** Texte centré standard du diagramme (gras, sans-serif, centré sur les 2 axes). */
const centeredText = (
  key: string,
  x: number,
  y: number,
  text: string,
  fill: string,
  fontSize: number,
): TextP => ({
  kind: 'text',
  key,
  x,
  y,
  text,
  fill,
  fontSize,
  fontWeight: 'bold',
  fontFamily: FONT_SANS,
  textAnchor: 'middle',
  dominantBaseline: 'central',
});

/** Indicateurs dessus le sillet : racine à vide (R), corde ouverte (○) ou muette (×). */
export const buildNutIndicators = ({
  diagram,
  layout,
  X,
  Y,
  stringX,
}: RenderContext): Primitive[] => {
  const { nutZone } = layout;
  const prims: Primitive[] = [];
  for (let i = 0; i < 6; i++) {
    const status = diagramFingering(diagram, i);
    const hasFretted =
      (diagram.root !== null && diagram.root.s === i && diagram.root.f >= 0) ||
      diagram.notes.some((n) => n.s === i && n.f >= 0);
    const isOpenRoot = diagram.root !== null && diagram.root.s === i && diagram.root.f === -1;
    const cx = X(stringX(i), nutZone);
    const cy = Y(stringX(i), nutZone);

    if (isOpenRoot) {
      prims.push({
        kind: 'group',
        key: `nut-ind-${i}`,
        children: [
          { kind: 'circle', key: `nut-ind-${i}-circle`, cx, cy, r: OPEN_ROOT_R, fill: C_RED },
          centeredText(`nut-ind-${i}-label`, cx, cy, 'R', C_WHITE, FS_OPEN_ROOT_LABEL),
        ],
      });
      continue;
    }
    if (hasFretted) continue;
    // Cordes sans indication (doigté vide) → croix × par défaut ; chiffré (1-4) → rien.
    if (status !== '' && status !== '0' && status !== 'X') continue;

    prims.push(
      centeredText(
        `nut-ind-${i}`,
        cx,
        cy,
        status === '0' ? '○' : '×',
        status === '0' ? C_GOLD : C_RED,
        FS_OPEN_IND,
      ),
    );
  }
  return prims;
};

/** Racine frettée (masquée si hors gabarit après baisse des frettes). */
export const buildRoot = ({
  diagram,
  layout,
  scale,
  dotR,
  X,
  Y,
  stringX,
}: RenderContext): Primitive[] => {
  const { frets, gap, offsetY } = layout;
  const root = diagram.root;
  if (root === null || root.f < 0 || root.f >= frets) return [];
  const cx = X(stringX(root.s), offsetY + root.f * gap + gap / 2);
  const cy = Y(stringX(root.s), offsetY + root.f * gap + gap / 2);
  return [
    {
      kind: 'group',
      key: 'root',
      children: [
        { kind: 'circle', key: 'root-circle', cx, cy, r: dotR, fill: C_RED },
        centeredText('root-label', cx, cy, 'R', C_WHITE, FS_ROOT * scale),
      ],
    },
  ];
};

/** Notes frettées : pastille de couleur d'intervalle + label (masquées hors gabarit). */
export const buildNotes = ({
  diagram,
  layout,
  offsets,
  startFret,
  scale,
  dotR,
  X,
  Y,
  stringX,
}: RenderContext): Primitive[] => {
  const { frets, gap, offsetY } = layout;
  const prims: Primitive[] = [];
  for (const note of diagram.notes) {
    if (note.f >= frets) continue;
    const info = getIntervalInfo(diagram.root, note, startFret, offsets);
    const cx = X(stringX(note.s), offsetY + note.f * gap + gap / 2);
    const cy = Y(stringX(note.s), offsetY + note.f * gap + gap / 2);
    prims.push({
      kind: 'group',
      key: `note-${note.id}`,
      children: [
        { kind: 'circle', key: `note-${note.id}-circle`, cx, cy, r: dotR, fill: info.color },
        centeredText(`note-${note.id}-label`, cx, cy, info.label, info.text, FS_NOTE * scale),
      ],
    });
  }
  return prims;
};
