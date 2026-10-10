import type { Group } from '../../types';
import type { ChordsState } from '../types';

/**
 * Opérations pures sur l'arborescence groupes/accords.
 * Extraites de `documentSlice` pour en limiter la taille ; le comportement et
 * l'API publique du store sont inchangés.
 */

/** Déplace un groupe dans la liste (null si introuvable). */
export const reorderGroup = (
  groups: Group[],
  sourceId: string,
  targetId: string,
): Group[] | null => {
  if (sourceId === targetId) return null;
  const list = [...groups];
  const from = list.findIndex((g) => g.id === sourceId);
  const to = list.findIndex((g) => g.id === targetId);
  if (from === -1 || to === -1) return null;
  const [removed] = list.splice(from, 1);
  list.splice(to, 0, removed);
  return list;
};

/** Patch des groupes + diagrammes après déplacement d'un accord. */
export const relocateDiagram = (
  s: ChordsState,
  sourceDiagId: string,
  sourceGroupId: string,
  targetId: string,
  targetType: 'group' | 'diagram',
): Pick<ChordsState, 'groups' | 'diagrams'> | null => {
  const destGroupId = targetType === 'group' ? targetId : s.diagrams[targetId]?.groupId;
  if (!destGroupId) return null;
  const destId: string = destGroupId;

  const groups = s.groups.map((g) =>
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

  return {
    groups: nextGroups,
    diagrams: { ...s.diagrams, [sourceDiagId]: { ...s.diagrams[sourceDiagId], groupId: destId } },
  };
};

/** Patch après suppression d'un groupe (null si refusé). */
export const removeGroup = (
  s: ChordsState,
  gId: string,
): Pick<ChordsState, 'groups' | 'diagrams' | 'activeDiagramId'> | null => {
  if (s.groups.length <= 1) return null;

  const groupToDelete = s.groups.find((g) => g.id === gId);
  if (!groupToDelete) return null;

  const remaining = s.groups.filter((g) => g.id !== gId);
  const nextDiagrams = { ...s.diagrams };
  for (const id of groupToDelete.diagramIds) delete nextDiagrams[id];

  let nextActive = s.activeDiagramId;
  if (s.activeDiagramId && groupToDelete.diagramIds.includes(s.activeDiagramId)) {
    nextActive = remaining.find((g) => g.diagramIds.length > 0)?.diagramIds[0] ?? null;
  }

  return { groups: remaining, diagrams: nextDiagrams, activeDiagramId: nextActive };
};

/** Patch après suppression d'un accord (null si introuvable). */
export const removeDiagram = (
  s: ChordsState,
  dId: string,
): Pick<ChordsState, 'groups' | 'diagrams' | 'activeDiagramId' | 'selectedTextId'> | null => {
  const target = s.diagrams[dId];
  if (!target) return null;

  const nextDiagrams = { ...s.diagrams };
  delete nextDiagrams[dId];

  const nextGroups = s.groups.map((g) =>
    g.id === target.groupId ? { ...g, diagramIds: g.diagramIds.filter((id) => id !== dId) } : g,
  );

  let nextActive = s.activeDiagramId;
  if (s.activeDiagramId === dId) {
    const otherIds = Object.keys(nextDiagrams);
    nextActive = otherIds.length > 0 ? otherIds[0] : null;
  }

  return {
    groups: nextGroups,
    diagrams: nextDiagrams,
    activeDiagramId: nextActive,
    selectedTextId: nextActive === s.activeDiagramId ? s.selectedTextId : null,
  };
};
