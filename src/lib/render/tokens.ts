/**
 * Constantes de style du diagramme — source unique pour l'écran et l'export.
 * Les couleurs d'intervalles viennent de lib/theory (getIntervalInfo).
 */

/** Blanc : titre, cordes, frettes, libellés « R ». */
export const C_WHITE = '#ffffff';
/** Or : labels dessus/sous la table, indicateur ○, filet de sélection. */
export const C_GOLD = '#cfa86a';
/** Rouge : racine frettée, indicateur ×, racine à vide. */
export const C_RED = '#ef4444';

/** Police unique du diagramme. */
export const FONT_SANS = 'sans-serif';

/** Rayon de base des pastilles (multiplié par dotScale). */
export const DOT_R_BASE = 22;
/** Rayon du cercle de la racine à vide (corde au-dessus du sillet). */
export const OPEN_ROOT_R = 16;

/** Tailles de police (racine et notes multipliées par dotScale). */
export const FS_ROOT = 18;
export const FS_NOTE = 15;
export const FS_OPEN_ROOT_LABEL = 14;
export const FS_OPEN_IND = 24;
export const FS_NUT_LABEL = 16;
export const FS_BOTTOM = 18;

/** Épaisseur des cordes : rétrécit de 12 % par corde (corde 6 la plus épaisse). */
export const STRING_TAPER = 0.12;
/** Mode horizontal : distance entre le bas du canvas et les numéros de cases. */
export const FRET_NUM_BOTTOM_GAP = 37;
