import type { Variants } from 'motion/react';

/** Apparition douce montante — variante standard de la landing. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Conteneur qui échelonne ses enfants (banderole d'entrée 0,09 s). */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

/** Viewport unique : une seule apparition, déclenchée 80 px avant l'entrée. */
export const viewportOnce = { once: true, margin: '-80px' } as const;
