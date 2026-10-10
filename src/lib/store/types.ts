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

export interface DocPayload extends Pick<ChordsFile, 'groups' | 'diagrams'> {
  openGroups?: Record<string, boolean>;
  activeDiagramId?: string | null;
}

export interface ChordsState {
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
  /** Case survolée par le pointeur (éphémère) : index de corde 0-5 + case absolue. */
  hoverCell: { string: number; fret: number } | null;

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
  /** Transpose fondamentale + notes du diagramme actif d'un demi-ton (wrap 0-11). */
  transposeActive: (delta: number) => void;

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
  /** Case survolée (null = pointeur hors grille). */
  setHoverCell: (cell: { string: number; fret: number } | null) => void;
}

/** `set` de Zustand 5 (pas de `replace: true` utilisé par le store). */
export type StoreSet = (
  partial:
    | ChordsState
    | Partial<ChordsState>
    | ((s: ChordsState) => ChordsState | Partial<ChordsState>),
  replace?: false | undefined,
) => void;

/** `get` de Zustand 5 : état complet courant. */
export type StoreGet = () => ChordsState;
