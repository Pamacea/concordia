import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import RotatingWord from './RotatingWord';
import { fadeUp, staggerContainer } from './variants';

/** Hero : badge, titre dégradé, mot rotatif et double CTA. */
export default function Hero() {
  return (
    <section
      className="relative border-b border-neutral-800 overflow-hidden"
      style={{
        background: 'radial-gradient(70% 55% at 50% -10%, rgba(207,168,106,0.12), transparent 70%)',
      }}
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto px-6 pt-20 md:pt-28 pb-8 text-center"
        style={{ maxWidth: '56rem' }}
      >
        <motion.span
          variants={fadeUp}
          className="inline-block text-[11px] font-bold uppercase tracking-[0.3em] text-gold border border-gold/30 bg-neutral-900/60 px-3 py-1.5"
        >
          Créateur de diagrammes
        </motion.span>

        <motion.h1
          variants={fadeUp}
          className="font-cyber font-black text-5xl md:text-7xl lg:text-8xl tracking-tight mt-7 bg-gradient-to-b from-white to-[#d4b075] bg-clip-text text-transparent"
        >
          CONCORDIA
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-4 font-cyber text-lg md:text-xl font-bold tracking-wide"
        >
          <span className="text-neutral-500">l'atelier qui </span>
          <RotatingWord />
          <span className="text-neutral-500"> vos accords</span>
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="mt-6 text-neutral-400 text-base md:text-lg leading-relaxed"
        >
          Dessinez des diagrammes d'accord de guitare nets et personnalisables — accordage par
          diagramme, indicateurs de notes ou d'intervalles, export en un clic.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            to="/editor"
            className="group inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-neutral-950 px-7 py-3.5 text-sm font-semibold transition-colors duration-100 shadow"
          >
            Créer maintenant
            <ArrowRight
              size={16}
              className="transition-transform duration-100 group-hover:translate-x-0.5"
            />
          </Link>
          <a
            href="#exemple"
            className="inline-flex items-center gap-2 border border-neutral-700 hover:border-gold text-white px-7 py-3.5 text-sm font-semibold transition-colors duration-100"
          >
            Voir un exemple
          </a>
        </motion.div>

        <div className="mt-12 flex flex-col items-center gap-2 text-neutral-600">
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll down</span>
          <span className="h-8 w-px bg-gradient-to-b from-neutral-600 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
