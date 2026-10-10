import type { IntervalInfo, Position, TuningId } from './types';

/** Démis tons depuis Mi2 : E2, A2, D3, G3, B3, E4 */
export const STRING_OFFSETS = [0, 5, 10, 15, 19, 24];

export const NOTE_NAMES = ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#'];

/** Accordages pré-réglés : demi-tons depuis Mi2, index 0 = corde 6 (la plus grave). */
export const TUNINGS: Record<TuningId, { name: string; offsets: number[] }> = {
  'standard-e': { name: 'Standard E', offsets: [0, 5, 10, 15, 19, 24] },
  'half-step-down': { name: 'Half-step down', offsets: [-1, 4, 9, 14, 18, 23] },
  'whole-step-down': { name: 'Whole-step down', offsets: [-2, 3, 8, 13, 17, 22] },
  'drop-d': { name: 'Drop D', offsets: [-2, 5, 10, 15, 19, 24] },
  'drop-cs': { name: 'Drop C#', offsets: [-3, 5, 10, 15, 19, 24] },
  'drop-c': { name: 'Drop C', offsets: [-4, 5, 10, 15, 19, 24] },
  dadgad: { name: 'DADGAD', offsets: [-2, 5, 10, 15, 17, 22] },
  'open-g': { name: 'Open G', offsets: [3, 10, 15, 19, 22, 27] },
  'open-d': { name: 'Open D', offsets: [-2, 5, 10, 14, 17, 22] },
  'open-e': { name: 'Open E', offsets: [0, 7, 12, 16, 19, 24] },
  'open-a': { name: 'Open A', offsets: [5, 12, 17, 21, 24, 29] },
  nashville: { name: 'Nashville (C6)', offsets: [12, 17, 22, 15, 19, 24] },
};

/** Offsets d'un accordage ; repli sur l'accordage standard si id inconnu. */
export const tuningOffsets = (id?: TuningId): number[] =>
  id && TUNINGS[id] ? TUNINGS[id].offsets : STRING_OFFSETS;

const INTERVALS: Record<number, IntervalInfo> = {
  0: { label: 'R', color: '#ef4444', text: '#ffffff' },
  1: { label: 'b2', color: '#f97316', text: '#ffffff' },
  2: { label: '2', color: '#f97316', text: '#ffffff' },
  3: { label: 'b3', color: '#22c55e', text: '#ffffff' },
  4: { label: '3', color: '#22c55e', text: '#ffffff' },
  5: { label: '4', color: '#ec4899', text: '#ffffff' },
  6: { label: 'b5', color: '#0284c7', text: '#ffffff' },
  7: { label: '5', color: '#38bdf8', text: '#000000' },
  8: { label: 'b6', color: '#a855f7', text: '#ffffff' },
  9: { label: '6', color: '#a855f7', text: '#ffffff' },
  10: { label: 'b7', color: '#eab308', text: '#000000' },
  11: { label: '7', color: '#eab308', text: '#000000' },
};

const UNKNOWN: IntervalInfo = { label: '?', color: '#6b7280', text: '#ffffff' };

/** Classe de hauteur en 0–11 (les offsets peuvent être négatifs : Drop C, Nashville…). */
const pitchClass = (pitch: number): number => ((pitch % 12) + 12) % 12;

/** Pitch absolu (démis tons depuis Mi2) d'une position donnée. */
const pitchOf = (pos: Position, startFret: number, offsets: number[] = STRING_OFFSETS): number => {
  const actualFret = pos.f === -1 ? 0 : startFret + pos.f;
  return offsets[pos.s] + actualFret;
};

/** Intervalle entre deux hauteurs absolues. */
const getIntervalFromPitches = (rootPitch: number, pitch: number): IntervalInfo =>
  INTERVALS[pitchClass(pitch - rootPitch)] ?? UNKNOWN;

export const getIntervalInfo = (
  rootPos: Position | null,
  notePos: Position,
  startFret = 1,
  offsets: number[] = STRING_OFFSETS,
): IntervalInfo => {
  if (!rootPos) return UNKNOWN;
  return getIntervalFromPitches(
    pitchOf(rootPos, startFret, offsets),
    pitchOf(notePos, startFret, offsets),
  );
};

export const getNoteName = (
  stringIdx: number,
  actualFret: number,
  offsets: number[] = STRING_OFFSETS,
): string => NOTE_NAMES[pitchClass(offsets[stringIdx] + actualFret)];
