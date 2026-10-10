import { generateId } from '../../id';
import type { FreeText } from '../../types';
import type { ChordsState, StoreGet, StoreSet } from '../types';

export const textSlice = (
  set: StoreSet,
  get: StoreGet,
): Pick<ChordsState, 'selectText' | 'addText' | 'updateText' | 'moveText' | 'deleteText'> => ({
  selectText: (tId) => set({ selectedTextId: tId }),

  addText: (x, y) => {
    const tId = generateId();
    const newText: FreeText = { id: tId, x, y, text: 'Texte' };
    get().updateActiveDiagram((d) => ({ ...d, texts: [...d.texts, newText] }));
    set({ selectedTextId: tId });
    return tId;
  },

  updateText: (tId, patch) => {
    get().updateActiveDiagram((d) => ({
      ...d,
      texts: d.texts.map((t) => (t.id === tId ? { ...t, ...patch } : t)),
    }));
  },

  moveText: (tId, x, y) => {
    get().updateActiveDiagram((d) => ({
      ...d,
      texts: d.texts.map((t) => (t.id === tId ? { ...t, x, y } : t)),
    }));
  },

  deleteText: (tId) => {
    get().updateActiveDiagram((d) => ({
      ...d,
      texts: d.texts.filter((t) => t.id !== tId),
    }));
    if (get().selectedTextId === tId) set({ selectedTextId: null });
  },
});
