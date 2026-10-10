import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { createSVGString } from '../export/createSVGString';
import { SHOWCASE_STYLE, SLIDES } from './showcaseDiagrams';
import { fadeUp, viewportOnce } from './variants';

/** Carrousel 01 → 07 : vrais diagrammes rendus par createSVGString. */
export default function Showcase() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const slide = SLIDES[index];
  const svg = useMemo(() => createSVGString(slide.diagram, SHOWCASE_STYLE), [slide]);

  const go = (delta: number) => {
    setDir(delta);
    setIndex((i) => (i + delta + SLIDES.length) % SLIDES.length);
  };

  const num = String(index + 1).padStart(2, '0');

  return (
    <section id="exemple" className="scroll-mt-20 border-b border-neutral-800 py-20 md:py-28">
      <div className="mx-auto px-6" style={{ maxWidth: '72rem' }}>
        <motion.header
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="text-center"
        >
          <p className="text-gold uppercase tracking-wider text-xs">Exemple</p>
          <h2 className="mt-3 font-cyber text-2xl md:text-4xl font-black text-white">
            Sept accords, un rendu d'export
          </h2>
        </motion.header>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-10 bg-neutral-900/40 border border-neutral-800 backdrop-blur p-6 md:p-10"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide.diagram.id}
              initial={{ x: dir * 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: dir * -40, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col md:flex-row items-center gap-6 md:gap-12"
            >
              <span
                aria-hidden="true"
                className="font-cyber font-black text-8xl leading-none text-neutral-800 select-none"
              >
                {num}
              </span>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-cyber text-3xl md:text-4xl font-black text-white">
                  {slide.symbol}
                </h3>
                <p className="mt-2 text-sm uppercase tracking-widest text-gold">{slide.title}</p>
                <p className="mt-3 text-sm text-neutral-400 leading-relaxed">{slide.blurb}</p>
              </div>
              <div
                className="diagram-preview shrink-0"
                style={{ maxWidth: '17rem' }}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-neutral-800 pt-6">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Diagramme précédent"
              className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-gold border border-neutral-700 hover:border-gold px-4 py-2 transition-colors duration-100"
            >
              <ChevronLeft size={16} aria-hidden="true" />
              Précédent
            </button>
            <span className="font-cyber text-sm text-neutral-500 tabular-nums" aria-live="polite">
              {num} / 07
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Diagramme suivant"
              className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-gold border border-neutral-700 hover:border-gold px-4 py-2 transition-colors duration-100"
            >
              Suivant
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
