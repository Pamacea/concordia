import type { Diagram, ExportScope, Group } from '../../lib/types';

/** Liste des diagrammes à exporter selon le périmètre choisi. */
export const getTargetDiagramsForExport = (
  scope: ExportScope,
  groups: Group[],
  diagrams: Record<string, Diagram>,
  selectedGroupId: string,
  selectedIds: Set<string>,
): Diagram[] => {
  if (scope === 'all') {
    return Object.values(diagrams);
  }
  if (scope === 'group') {
    const targetGroup = groups.find((g) => g.id === selectedGroupId);
    if (!targetGroup) return [];
    return targetGroup.diagramIds.map((id) => diagrams[id]).filter((d): d is Diagram => !!d);
  }
  return Array.from(selectedIds)
    .map((id) => diagrams[id])
    .filter((d): d is Diagram => !!d);
};
