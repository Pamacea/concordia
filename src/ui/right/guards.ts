import { TUNINGS } from '../../lib/theory';
import type { BottomIndicatorType, NutIndicatorType, TuningId } from '../../lib/types';

export const BOTTOM_INDICATOR_VALUES: readonly BottomIndicatorType[] = [
  'notes',
  'fingerings',
  'intervals',
  'none',
];

export function isBottomIndicatorType(value: string): value is BottomIndicatorType {
  return BOTTOM_INDICATOR_VALUES.some((v) => v === value);
}

export function toBottomIndicatorType(value: string): BottomIndicatorType {
  return isBottomIndicatorType(value) ? value : 'none';
}

export function isTuningId(value: string): value is TuningId {
  return Object.hasOwn(TUNINGS, value);
}

export function toNutIndicatorType(value: string): NutIndicatorType {
  return value === 'notes' ? 'notes' : 'none';
}
