import type { Diagram, Fingerings } from './types';

/** Doigté d'une corde (va-string jamais undefined en TypeScript strict). */
export const fingeringOf = (fingerings: Fingerings, stringIdx: number): string =>
  fingerings[stringIdx] ?? '';

export const diagramFingering = (diagram: Diagram, stringIdx: number): string =>
  fingeringOf(diagram.fingerings, stringIdx);
