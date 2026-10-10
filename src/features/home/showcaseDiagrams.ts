import type { Diagram, Fingerings, Position, StyleSettings } from '../../lib/types';

/** Style du showcase (proche du style par défaut de l'éditeur). */
export const SHOWCASE_STYLE: StyleSettings = {
  diagramBgColor: '#0d0d0d',
  nutThickness: 16,
  nutOpacity: 100,
  nutColor: '#ffffff',
  stringThicknessBase: 4,
  stringOpacity: 100,
  fretThickness: 4,
  fretOpacity: 100,
  showFretNumbers: false,
  fretNumberSize: 18,
  fretNumberColor: '#a3a3a3',
  bottomIndicatorType: 'none',
};

export interface Slide {
  symbol: string;
  title: string;
  blurb: string;
  diagram: Diagram;
}

/** `"2:-1"` → position corde/case (-1 = à vide). */
const pos = (spec: string): Position => {
  const [s, f] = spec.split(':');
  return { s: Number(s), f: Number(f) };
};

/** `"2:1 3:1 4:0"` → notes indexées (corde:case). */
const notesOf = (id: string, spec: string): Diagram['notes'] =>
  spec.split(' ').map((tok, i) => ({ id: `${id}-n${i}`, ...pos(tok) }));

/** `"X 0 2 3 1 0"` → doigtés corde 6 → corde 1. */
const fingeringsOf = (spec: string): Fingerings =>
  Object.fromEntries(spec.split(' ').map((tok, i) => [String(i), tok]));

/** Construit un diagramme valide (position ouverte, 5 frettes affichées). */
const make = (
  id: string,
  symbol: string,
  rootSpec: string,
  frettedSpec: string,
  fingerSpec: string,
): Diagram => ({
  id,
  groupId: 'showcase',
  name: symbol,
  startFret: 1,
  fretCount: 5,
  orientation: 'vertical',
  tuning: 'standard-e',
  nutIndicator: 'none',
  root: pos(rootSpec),
  notes: notesOf(id, frettedSpec),
  fingerings: fingeringsOf(fingerSpec),
  texts: [],
});

/** Les 7 diagrammes du carrousel 01 → 07 (toutes positions ouvertes). */
export const SLIDES: Slide[] = [
  {
    symbol: 'Am',
    title: 'La mineur',
    blurb: 'Position ouverte — le premier accord de tous les guitaristes.',
    diagram: make('sc-am', 'Am', '1:-1', '2:1 3:1 4:0', 'X 0 2 3 1 0'),
  },
  {
    symbol: 'C',
    title: 'Do majeur',
    blurb: 'La forme ouverte en « A », racine sur la corde de La.',
    diagram: make('sc-c', 'C', '1:2', '2:1 4:0', 'X 3 2 0 1 0'),
  },
  {
    symbol: 'G',
    title: 'Sol majeur',
    blurb: 'Accordage ouvert complet, six cordes qui sonnent.',
    diagram: make('sc-g', 'G', '0:2', '1:1 5:2', '2 1 0 0 0 3'),
  },
  {
    symbol: 'D',
    title: 'Ré majeur',
    blurb: 'Triangle de la position ouverte, racine corde de Ré à vide.',
    diagram: make('sc-d', 'D', '2:-1', '3:1 4:2 5:1', 'X X 0 1 3 2'),
  },
  {
    symbol: 'Em',
    title: 'Mi mineur',
    blurb: 'Le mineur le plus simple : deux doigts, six cordes.',
    diagram: make('sc-em', 'Em', '0:-1', '1:1 2:1', '0 2 3 0 0 0'),
  },
  {
    symbol: 'F',
    title: 'Fa majeur',
    blurb: 'Le barre-corde : six notes tenues par un seul doigt.',
    diagram: make('sc-f', 'F', '0:0', '1:2 2:2 3:1 4:0 5:0', '1 3 4 2 1 1'),
  },
  {
    symbol: 'Dm',
    title: 'Ré mineur',
    blurb: 'Le petit frère de D : même forme, tierce mineure.',
    diagram: make('sc-dm', 'Dm', '2:-1', '3:1 4:0 5:0', 'X X 0 2 3 1'),
  },
];
