import { diagramFingering } from './fingering';
import { getIntervalInfo, getNoteName } from './theory';
import type { Diagram, StyleSettings } from './types';

/** Libellé affiché sous la table pour une corde donnée. */
export const bottomLabel = (
  diag: Diagram,
  style: StyleSettings,
  stringIdx: number,
  startFret: number,
): string => {
  const customFingering = diagramFingering(diag, stringIdx);

  if (style.bottomIndicatorType === 'fingerings') {
    return customFingering;
  }

  if (style.bottomIndicatorType === 'notes') {
    let actualFret = -1;
    if (diag.root !== null && diag.root.s === stringIdx) {
      actualFret = diag.root.f === -1 ? 0 : startFret + diag.root.f;
    }
    const noteOnString = diag.notes.find((n) => n.s === stringIdx);
    if (noteOnString) actualFret = startFret + noteOnString.f;

    if (customFingering === 'X' && actualFret === -1) return 'X';
    if (actualFret >= 0) return getNoteName(stringIdx, actualFret);
    if (customFingering === '0') return getNoteName(stringIdx, 0);
    return '';
  }

  // intervals
  let played: Diagram['root'] = null;
  if (diag.root !== null && diag.root.s === stringIdx) played = diag.root;
  const noteOnString = diag.notes.find((n) => n.s === stringIdx);
  if (noteOnString) played = noteOnString;

  if (played) {
    return getIntervalInfo(diag.root, played, startFret).label;
  }
  return customFingering;
};
