import type { ChordsState, StoreGet, StoreSet } from '../types';

export const uiSlice = (
  set: StoreSet,
  get: StoreGet,
  narrowViewport: boolean,
): Pick<
  ChordsState,
  | 'activeTool'
  | 'leftSidebarOpen'
  | 'rightSidebarOpen'
  | 'toast'
  | 'selectedTextId'
  | 'hoverCell'
  | 'setActiveTool'
  | 'setSidebar'
  | 'showToast'
  | 'hideToast'
  | 'setHoverCell'
> => ({
  activeTool: 'note',
  leftSidebarOpen: !narrowViewport,
  rightSidebarOpen: !narrowViewport,
  toast: null,
  selectedTextId: null,
  hoverCell: null,

  setActiveTool: (tool) => set({ activeTool: tool }),

  setSidebar: (side, open) =>
    set(side === 'left' ? { leftSidebarOpen: open } : { rightSidebarOpen: open }),

  setHoverCell: (cell) => set({ hoverCell: cell }),

  showToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => {
      if (get().toast?.message === message) set({ toast: null });
    }, 3500);
  },

  hideToast: () => set({ toast: null }),
});
