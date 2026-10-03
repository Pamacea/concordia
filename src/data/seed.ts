import type { ChordsFile } from '../lib/types';
import raw from './chords.json';

/** Base de données initiale embarquée (chargée une seule fois au démarrage). */
export const SEED: ChordsFile = raw;
