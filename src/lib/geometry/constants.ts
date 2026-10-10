export const OFFSET_X = 65;
export const OFFSET_Y = 120;
/** Espacement des cordes par défaut (7 frettes et moins). */
export const STRING_GAP = 70;
/** Écart entre frettes « standard » (plafond au-delà duquel les cases rétrécissent). */
export const FRET_GAP = 75;

/** Longueur max du bloc frettes : au-delà, les cases se rétrécissent. */
export const MAX_BOARD = 640;

/** Base du resserrement des cordes : espacement = max(plancher, min(70, 560 / frettes)). */
export const STRING_GAP_BASE = 560;
/** Plancher de l'espacement des cordes (beaucoup de frettes). */
export const STRING_GAP_MIN = 40;

export const MAX_FRET = 24;
export const MIN_FRETS = 1;
export const MAX_FRETS = 12;

/** Titre du diagramme : taille bornée puis passage sur plusieurs lignes. */
export const TITLE_SIZE_MAX = 24;
export const TITLE_SIZE_MIN = 16;
export const TITLE_LEAD_RATIO = 1.35;
export const TITLE_MARGIN = 24;
/** Centre vertical de la première ligne de titre (repère écran). */
export const TITLE_FIRST_CY = 45;
/** Bas du bloc titre → indicateurs sillet. */
export const TITLE_TO_NUT = 34;
/** Indicateurs sillet → sillet (début de la table). */
export const NUT_TO_BOARD = 25;
/** Bande réservée aux indicateurs dessus le sillet (0 si désactivés). */
export const NUT_LABEL_BAND = 46;
/** Distance (logique) entre le centre des labels dessus sillet et celui des ○/×. */
export const NUT_LABEL_GAP = 34;
/** Réserve sous les cordes en mode horizontal (numéros de cases). */
export const HORIZONTAL_BOTTOM = 77;
/** Distance entre les numéros de cases et la table (axe logique X, mode vertical). */
export const FRET_NUM_GAP = 40;

/** Style par défaut des textes libres. */
export const DEFAULT_TEXT_SIZE = 26;
export const MIN_TEXT_SIZE = 12;
