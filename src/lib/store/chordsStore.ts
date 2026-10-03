import { create } from 'zustand';
import type {
  ChordsFile,
  Diagram,
  FreeText,
  Group,
  StyleSettings,
  ToastKind,
  ToastMessage,
  Tool,
} from '../types';
import { generateId } from '../id';

export const DEFAULT_STYLE: StyleSettings = {
  diagramBgColor: '#1c1c1e',
  nutThickness: 8,
  nutOpacity: 100,
  nutColor: '#ffffff',
  stringThicknessBase: 3,
  stringOpacity: 90,
  fretThickness: 3,
  fretOpacity: 90,
  showFretNumbers: true,
  fretNumberSize: 18,
  fretNumberColor: '#a3a3a3',
  bottomIndicatorType: 'none',
};

export interface DocPayload extends Pick<ChordsFile, 'groups' | 'diagrams'> {
  openGroups?: Record<string, boolean>;
  activeDiagramId?: string | null;
}

export const allGroupsOpen = (groups: Group[]): Record<string, boolean> =>
  Object.fromEntries(groups.map((g) => [g.id, true]));

export const firstDiagramId = (groups: Group[]): string | null =>
  groups[0]?.diagramIds[0] ?? null;

interface ChordsState {
  // — Document (persisté) —
  groups: Group[];
  diagrams: Record<string, Diagram>;
  activeDiagramId: string | null;
  openGroups: Record<string, boolean>;

  // — Style diagramme (persisté) —
  style: StyleSettings;

  // — UI (éphémère) —
  activeTool: Tool;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  toast: ToastMessage | null;
  /** Texte sélectionné sur le canvas (outil texte / pointeur). */
  selectedTextId: string | null;

  // — Actions document —
  hydrate: (payload: DocPayload) => void;
  addGroup: () => void;
  deleteGroup: (gId: string) => void;
  renameGroup: (gId: string, name: string) => void;
  toggleGroupOpen: (gId: string) => void;
  addDiagram: (gId: string) => void;
  deleteDiagram: (dId: string) => void;
  setActiveDiagram: (dId: string) => void;
  moveGroup: (sourceId: string, targetId: string) => void;
  moveDiagram: (
    sourceDiagId: string,
    sourceGroupId: string,
    targetId: string,
    targetType: 'group' | 'diagram',
  ) => void;
  updateActiveDiagram: (updater: (d: Diagram) => Diagram) => void;

  // — Actions textes libres —
  selectText: (tId: string | null) => void;
  /** Crée un texte au point logique et le sélectionne. Retourne son id. */
  addText: (x: number, y: number) => string;
  updateText: (tId: string, patch: Partial<Omit<FreeText, 'id'>>) => void;
  moveText: (tId: string, x: number, y: number) => void;
  deleteText: (tId: string) => void;

  // — Actions style / UI —
  updateStyle: (patch: Partial<StyleSettings>) => void;
  setActiveTool: (tool: Tool) => void;
  setSidebar: (side: 'left' | 'right', open: boolean) => void;
  showToast: (message: string, type?: ToastKind) => void;
  hideToast: () => void;
}

/** Sur mobile/tablette étroite, les sidebars démarrent fermées (overlay). */
const narrowViewport = typeof window !== 'undefined' && window.innerWidth < 768;

export const useChordsStore = create<ChordsState>()((set, get) => ({
  groups: [],
  diagrams: {},
  activeDiagramId: null,
  openGroups: {},
  style: DEFAULT_STYLE,

  activeTool: 'note',
  leftSidebarOpen: !narrowViewport,
  rightSidebarOpen: !narrowViewport,
  toast: null,
  selectedTextId: null,

  hydrate: (payload) => {
    set({
      groups: payload.groups,
      diagrams: payload.diagrams,
      openGroups: payload.openGroups ?? allGroupsOpen(payload.groups),
      activeDiagramId:
        payload.activeDiagramId !== undefined
          ? payload.activeDiagramId
          : firstDiagramId(payload.groups),
      selectedTextId: null,
    });
  },

  addGroup: () => {
    const gId = generateId();
    set((s) => ({
      groups: [...s.groups, { id: gId, name: 'Nouveau Groupe', diagramIds: [] }],
      openGroups: { ...s.openGroups, [gId]: true },
    }));
  },

  deleteGroup: (gId) => {
    const { groups, diagrams, activeDiagramId } = get();
    if (groups.length <= 1) return;

    const groupToDelete = groups.find((g) => g.id === gId);
    if (!groupToDelete) return;

    const remaining = groups.filter((g) => g.id !== gId);
    const nextDiagrams = { ...diagrams };
    for (const id of groupToDelete.diagramIds) delete nextDiagrams[id];

    let nextActive = activeDiagramId;
    if (activeDiagramId && groupToDelete.diagramIds.includes(activeDiagramId)) {
      nextActive = remaining.find((g) => g.diagramIds.length > 0)?.diagramIds[0] ?? null;
    }

    set({ groups: remaining, diagrams: nextDiagrams, activeDiagramId: nextActive });
  },

  renameGroup: (gId, name) => {
    set((s) => ({
      groups: s.groups.map((g) => (g.id === gId ? { ...g, name } : g)),
    }));
  },

  toggleGroupOpen: (gId) => {
    set((s) => ({ openGroups: { ...s.openGroups, [gId]: !s.openGroups[gId] } }));
  },

  addDiagram: (gId) => {
    const dId = generateId();
    const newDiagram: Diagram = {
      id: dId,
      groupId: gId,
      name: 'Nouvel Accord',
      startFret: 3,
      root: null,
      notes: [],
      fingerings: { 0: 'X', 1: '1', 2: '3', 3: '4', 4: '2', 5: '1' },
      texts: [],
    };
    set((s) => ({
      diagrams: { ...s.diagrams, [dId]: newDiagram },
      groups: s.groups.map((g) =>
        g.id === gId ? { ...g, diagramIds: [...g.diagramIds, dId] } : g,
      ),
      activeDiagramId: dId,
      selectedTextId: null,
    }));
  },

  deleteDiagram: (dId) => {
    const { diagrams, groups, activeDiagramId } = get();
    const target = diagrams[dId];
    if (!target) return;

    const nextDiagrams = { ...diagrams };
    delete nextDiagrams[dId];

    const nextGroups = groups.map((g) =>
      g.id === target.groupId
        ? { ...g, diagramIds: g.diagramIds.filter((id) => id !== dId) }
        : g,
    );

    let nextActive = activeDiagramId;
    if (activeDiagramId === dId) {
      const otherIds = Object.keys(nextDiagrams);
      nextActive = otherIds.length > 0 ? otherIds[0] : null;
    }

    set({
      diagrams: nextDiagrams,
      groups: nextGroups,
      activeDiagramId: nextActive,
      selectedTextId: nextActive === activeDiagramId ? get().selectedTextId : null,
    });
  },

  setActiveDiagram: (dId) => set({ activeDiagramId: dId, selectedTextId: null }),

  moveGroup: (sourceId, targetId) => {
    if (sourceId === targetId) return;
    const list = [...get().groups];
    const from = list.findIndex((g) => g.id === sourceId);
    const to = list.findIndex((g) => g.id === targetId);
    if (from === -1 || to === -1) return;
    const [removed] = list.splice(from, 1);
    list.splice(to, 0, removed);
    set({ groups: list });
  },

  moveDiagram: (sourceDiagId, sourceGroupId, targetId, targetType) => {
    let destGroupId: string | undefined;
    if (targetType === 'group') {
      destGroupId = targetId;
    } else {
      destGroupId = get().diagrams[targetId]?.groupId;
    }
    if (!destGroupId) return;
    const destId: string = destGroupId;

    const groups = get().groups.map((g) =>
      g.id === sourceGroupId
        ? { ...g, diagramIds: g.diagramIds.filter((id) => id !== sourceDiagId) }
        : g,
    );

    const nextGroups = groups.map((g) => {
      if (g.id !== destId) return g;
      if (targetType === 'diagram' && targetId !== sourceDiagId) {
        const tIdx = g.diagramIds.indexOf(targetId);
        const newDList = [...g.diagramIds];
        if (tIdx !== -1) newDList.splice(tIdx, 0, sourceDiagId);
        else newDList.push(sourceDiagId);
        return { ...g, diagramIds: Array.from(new Set(newDList)) };
      }
      if (!g.diagramIds.includes(sourceDiagId)) {
        return { ...g, diagramIds: [...g.diagramIds, sourceDiagId] };
      }
      return g;
    });

    set((s) => ({
      groups: nextGroups,
      diagrams: {
        ...s.diagrams,
        [sourceDiagId]: { ...s.diagrams[sourceDiagId], groupId: destId },
      },
    }));
  },

  updateActiveDiagram: (updater) => {
    const id = get().activeDiagramId;
    if (!id) return;
    set((s) => ({
      diagrams: { ...s.diagrams, [id]: updater(s.diagrams[id]) },
    }));
  },

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

  updateStyle: (patch) => set((s) => ({ style: { ...s.style, ...patch } })),

  setActiveTool: (tool) => set({ activeTool: tool }),

  setSidebar: (side, open) =>
    set(side === 'left' ? { leftSidebarOpen: open } : { rightSidebarOpen: open }),

  showToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => {
      if (get().toast?.message === message) set({ toast: null });
    }, 3500);
  },

  hideToast: () => set({ toast: null }),
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
