import type { IntervalInfo, Position } from './types';

/** Démis tons depuis Mi2 : E2, A2, D3, G3, B3, E4 */
export const STRING_OFFSETS = [0, 5, 10, 15, 19, 24];

export const NOTE_NAMES = ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#'];

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

/** Pitch absolu (démis tons depuis Mi2) d'une position donnée. */
const pitchOf = (pos: Position, startFret: number): number => {
  const actualFret = pos.f === -1 ? 0 : startFret + pos.f;
  return STRING_OFFSETS[pos.s] + actualFret;
};

export const getIntervalInfo = (
  rootPos: Position | null,
  notePos: Position,
  startFret = 1,
): IntervalInfo => {
  if (!rootPos) return UNKNOWN;

  let diff = (pitchOf(notePos, startFret) - pitchOf(rootPos, startFret)) % 12;
  if (diff < 0) diff += 12;

  return INTERVALS[diff] ?? UNKNOWN;
};

export const getNoteName = (stringIdx: number, actualFret: number): string =>
  NOTE_NAMES[(STRING_OFFSETS[stringIdx] + actualFret) % 12];
