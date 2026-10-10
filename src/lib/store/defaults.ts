import type { Group, StyleSettings } from '../types';

export const DEFAULT_STYLE: StyleSettings = {
  diagramBgColor: '#0d0d0d',
  nutThickness: 16,
  nutOpacity: 100,
  nutColor: '#ffffff',
  stringThicknessBase: 4,
  stringOpacity: 100,
  fretThickness: 4,
  fretOpacity: 100,
  showFretNumbers: true,
  fretNumberSize: 18,
  fretNumberColor: '#a3a3a3',
  bottomIndicatorType: 'none',
};

export const allGroupsOpen = (groups: Group[]): Record<string, boolean> =>
  Object.fromEntries(groups.map((g) => [g.id, true]));

export const firstDiagramId = (groups: Group[]): string | null => groups[0]?.diagramIds[0] ?? null;
