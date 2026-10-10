import { MAX_FRET } from '../../geometry';
import type { Diagram, Position } from '../../types';

/** Wrap d'une classe de hauteur dans l'octave [0, 11]. */
export const wrap12 = (n: number): number => ((n % 12) + 12) % 12;

/** Case absolue d'un marqueur (0 = corde à vide / sillet). */
const absoluteFret = (startFret: number, p: Position): number => (p.f === -1 ? 0 : startFret + p.f);

/**
 * Case absolue après transposition de `delta` demi-tons.
 * Sous le sillet, on reboucle dans l'octave (wrap 0-11) : la classe de hauteur
 * est conservée et la corde reste jouable (E vide −1 → case 11).
 */
const shiftFret = (abs: number, delta: number): number => {
  const raw = abs + delta;
  if (raw >= 0) return Math.min(raw, MAX_FRET);
  return wrap12(raw);
};

/** Retourne la case relative attendue par le rendu (-1 = corde à vide). */
const toRelative = (abs: number, startFret: number): number => (abs === 0 ? -1 : abs - startFret);

/** Vrai si tous les marqueurs restent dans la fenêtre affichée. */
const fits = (start: number, frets: number, absolutes: number[]): boolean =>
  absolutes.every((a) => a === 0 || (a >= start && a <= start + frets - 1));

/** Recale la fenêtre de cases sur les marqueurs (inchangée si elle convient déjà). */
const fitStartFret = (current: number, frets: number, absolutes: number[]): number => {
  if (fits(current, frets, absolutes)) return current;
  const played = absolutes.filter((a) => a > 0);
  if (played.length === 0) return current;
  const min = Math.min(...played);
  const max = Math.max(...played);
  if (max - min > frets - 1) return current;
  return min;
};

/**
 * Transpose la fondamentale et les notes d'un diagramme d'un demi-ton.
 * Les cases sont numérotées : on déplace la position absolue, puis on recalcule
 * la fenêtre affichée pour que la forme reste visible. Les identifiants de notes,
 * les doigtés et l'accordage ne sont pas modifiés.
 */
export const transposeDiagram = (d: Diagram, delta: number, frets: number): Diagram => {
  if (!Number.isInteger(delta) || delta === 0) return d;

  const root = d.root;
  const rootFrom = root ? absoluteFret(d.startFret, root) : null;
  const notesFrom = d.notes.map((n) => absoluteFret(d.startFret, n));

  let rootTo = rootFrom === null ? null : shiftFret(rootFrom, delta);
  let notesTo = notesFrom.map((a) => shiftFret(a, delta));
  const collect = (): number[] => (rootTo === null ? notesTo : [...notesTo, rootTo]);

  let start = fitStartFret(d.startFret, frets, collect());

  // Un marqueur replié sous le sillet qui ne tient pas dans la fenêtre repasse
  // corde à vide (case 0) : il reste visible au lieu de sortir du diagramme.
  if (!fits(start, frets, collect())) {
    notesTo = notesTo.map((a, i) => (notesFrom[i] + delta < 0 ? 0 : a));
    if (rootFrom !== null && rootFrom + delta < 0) rootTo = 0;
    start = fitStartFret(start, frets, collect());
  }

  const nextRoot = root && rootTo !== null ? { ...root, f: toRelative(rootTo, start) } : null;

  return {
    ...d,
    startFret: start,
    root: nextRoot,
    notes: d.notes.map((n, i) => ({ ...n, f: toRelative(notesTo[i], start) })),
  };
};
