import type { DiagramLayout } from '../geometry';
import type { Diagram, StyleSettings } from '../types';

/**
 * Primitives de rendu à coordonnées déjà projetées (transposition X/Y du mode
 * horizontal appliquée). Source unique partagée par l'écran et l'export SVG.
 */
export interface LineP {
  kind: 'line';
  /** Clé React stable (unique parmi ses siblings). */
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
  opacity?: number;
  strokeDasharray?: string;
}

export interface TextP {
  kind: 'text';
  key: string;
  x: number;
  y: number;
  text: string;
  fill: string;
  fontSize: number;
  fontWeight?: string;
  textAnchor?: 'start' | 'middle' | 'end';
  dominantBaseline?: 'central' | 'hanging' | 'mathematical' | 'auto' | 'middle';
  fontFamily?: string;
}

export interface CircleP {
  kind: 'circle';
  key: string;
  cx: number;
  cy: number;
  r: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface RectP {
  kind: 'rect';
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rx?: number;
}

export interface GroupP {
  kind: 'group';
  key: string;
  children: Primitive[];
}

export type Primitive = LineP | TextP | CircleP | RectP | GroupP;

/**
 * Contexte de construction des primitives : un seul appel à `diagramLayout`
 * et une seule projection écran pour tout le rendu.
 */
export interface RenderContext {
  diagram: Diagram;
  style: StyleSettings;
  layout: DiagramLayout;
  /** Case de départ réelle (1 par défaut). */
  startFret: number;
  /** Décalages de l'accordage (théorie). */
  offsets: number[];
  /** Échelle des pastilles/labels (dotScale). */
  scale: number;
  /** Rayon des pastilles (22 * scale). */
  dotR: number;
  /** Coordonnées logiques (repère vertical) → axe écran X. */
  X: (lx: number, ly: number) => number;
  /** Coordonnées logiques (repère vertical) → axe écran Y. */
  Y: (lx: number, ly: number) => number;
  /** Position (axe logique X) d'une corde : inversée en horizontal. */
  stringX: (s: number) => number;
}
