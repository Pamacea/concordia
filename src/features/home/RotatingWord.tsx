import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

const WORDS = ['dessine', 'partage', 'exporte'] as const;
const CYCLE_MS = 2200;

/** Mot rotatif du hero : dessine → partage → exporte, toutes les 2,2 s. */
export default function RotatingWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % WORDS.length), CYCLE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={WORDS[index]}
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 12, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="inline-block text-gold"
      >
        {WORDS[index]}
      </motion.span>
    </AnimatePresence>
  );
}
