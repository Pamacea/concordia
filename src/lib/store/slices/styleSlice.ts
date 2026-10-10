import { DEFAULT_STYLE } from '../defaults';
import type { ChordsState, StoreGet, StoreSet } from '../types';

export const styleSlice = (
  set: StoreSet,
  _get: StoreGet,
): Pick<ChordsState, 'style' | 'updateStyle'> => ({
  style: DEFAULT_STYLE,
  updateStyle: (patch) => set((s) => ({ style: { ...s.style, ...patch } })),
});
