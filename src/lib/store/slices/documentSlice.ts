import { diagramFrets } from '../../geometry';
import { generateId } from '../../id';
import type { Diagram } from '../../types';
import { allGroupsOpen, firstDiagramId } from '../defaults';
import type { ChordsState, StoreGet, StoreSet } from '../types';
import { removeDiagram, removeGroup, reorderGroup, relocateDiagram } from './treeOps';
import { transposeDiagram } from './transpose';

export const documentSlice = (
  set: StoreSet,
  get: StoreGet,
): Pick<
  ChordsState,
  | 'groups'
  | 'diagrams'
  | 'activeDiagramId'
  | 'openGroups'
  | 'hydrate'
  | 'addGroup'
  | 'deleteGroup'
  | 'renameGroup'
  | 'toggleGroupOpen'
  | 'addDiagram'
  | 'deleteDiagram'
  | 'setActiveDiagram'
  | 'moveGroup'
  | 'moveDiagram'
  | 'updateActiveDiagram'
  | 'transposeActive'
> => ({
  groups: [],
  diagrams: {},
  activeDiagramId: null,
  openGroups: {},

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
    const patch = removeGroup(get(), gId);
    if (patch) set(patch);
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
      tuning: 'standard-e',
      nutIndicator: 'none',
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
    const patch = removeDiagram(get(), dId);
    if (patch) set(patch);
  },

  setActiveDiagram: (dId) => set({ activeDiagramId: dId, selectedTextId: null }),

  moveGroup: (sourceId, targetId) => {
    const groups = reorderGroup(get().groups, sourceId, targetId);
    if (groups) set({ groups });
  },

  moveDiagram: (sourceDiagId, sourceGroupId, targetId, targetType) => {
    const patch = relocateDiagram(get(), sourceDiagId, sourceGroupId, targetId, targetType);
    if (patch) set(patch);
  },

  updateActiveDiagram: (updater) => {
    const id = get().activeDiagramId;
    if (!id) return;
    set((s) => ({
      diagrams: { ...s.diagrams, [id]: updater(s.diagrams[id]) },
    }));
  },

  transposeActive: (delta) => {
    const { activeDiagramId, diagrams, style } = get();
    if (!activeDiagramId) return;
    const target = diagrams[activeDiagramId];
    if (!target) return;
    const next = transposeDiagram(target, delta, diagramFrets(target, style));
    if (next === target) return;
    set((s) => ({ diagrams: { ...s.diagrams, [activeDiagramId]: next } }));
  },
});
