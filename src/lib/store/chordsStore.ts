import { create } from 'zustand';
import type { Diagram } from '../types';
import { documentSlice } from './slices/documentSlice';
import { styleSlice } from './slices/styleSlice';
import { textSlice } from './slices/textSlice';
import { uiSlice } from './slices/uiSlice';
import type { ChordsState } from './types';

export { DEFAULT_STYLE, allGroupsOpen, firstDiagramId } from './defaults';
export type { ChordsState, DocPayload, StoreGet, StoreSet } from './types';

/** Sur mobile/tablette étroite, les sidebars démarrent fermées (overlay). */
const narrowViewport = typeof window !== 'undefined' && window.innerWidth < 768;

export const useChordsStore = create<ChordsState>()((set, get) => ({
  ...documentSlice(set, get),
  ...textSlice(set, get),
  ...styleSlice(set, get),
  ...uiSlice(set, get, narrowViewport),
}));

export const getActiveDiagram = (): Diagram | null => {
  const { activeDiagramId, diagrams } = useChordsStore.getState();
  return activeDiagramId ? (diagrams[activeDiagramId] ?? null) : null;
};

/** Instance du store pour les tests/devtools (élagué du bundle de production). */
if (import.meta.env.DEV) {
  (window as unknown as { __CHORDS_STORE__?: typeof useChordsStore }).__CHORDS_STORE__ =
    useChordsStore;
}
