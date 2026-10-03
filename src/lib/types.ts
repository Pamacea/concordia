export interface Position {
  /** Index de corde : 0 = corde 6 (mi grave) … 5 = corde 1 (mi aigu) */
  s: number;
  /** Case relative (0 = première case affichée, -1 = corde à vide) */
  f: number;
}

export interface Note extends Position {
  id: string;
}

export type Fingerings = Record<string, string>;

export interface FreeText {
  id: string;
  x: number;
  y: number;
  text: string;
  /** Police CSS (défaut : sans-serif du thème). */
  fontFamily?: string;
  /** Taille en px (défaut : adaptée à la largeur du canvas). */
  fontSize?: number;
  /** Couleur CSS (défaut : blanc). */
  color?: string;
  /** Gras (défaut : true). */
  bold?: boolean;
}

export type DiagramOrientation = 'vertical' | 'horizontal';

export interface Diagram {
  id: string;
  groupId: string;
  name: string;
  startFret: number;
  /** Nombre de frettes affichées (défaut : déduit du style). */
  fretCount?: number;
  /** Orientation du diagramme (défaut : vertical). */
  orientation?: DiagramOrientation;
  root: Position | null;
  notes: Note[];
  fingerings: Fingerings;
  texts: FreeText[];
}

export interface Group {
  id: string;
  name: string;
  diagramIds: string[];
}

export interface ChordsFile {
  version: string;
  groups: Group[];
  diagrams: Record<string, Diagram>;
}

export type Tool = 'pointer' | 'note' | 'text' | 'eraser';

export type BottomIndicatorType = 'notes' | 'fingerings' | 'intervals' | 'none';

export interface StyleSettings {
  diagramBgColor: string;
  nutThickness: number;
  nutOpacity: number;
  nutColor: string;
  stringThicknessBase: number;
  stringOpacity: number;
  fretThickness: number;
  fretOpacity: number;
  showFretNumbers: boolean;
  fretNumberSize: number;
  fretNumberColor: string;
  bottomIndicatorType: BottomIndicatorType;
}

export type ExportFormat = 'json' | 'png' | 'svg' | 'pdf';

export type ExportScope = 'all' | 'group' | 'custom';

export type ToastKind = 'info' | 'success' | 'error';

export interface ToastMessage {
  message: string;
  type: ToastKind;
}

export interface IntervalInfo {
  label: string;
  color: string;
  text: string;
}
