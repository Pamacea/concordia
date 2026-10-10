import { motion, useScroll, useSpring } from 'motion/react';
import { Link } from 'react-router-dom';

const LINKS = [
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#exemple', label: 'Exemple' },
] as const;

/** Barre de navigation collante + indicateur de progression de scroll (2 px or). */
export default function Navbar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.3,
  });

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/70 backdrop-blur"
    >
      <nav
        className="mx-auto w-full px-6 h-16 flex items-center justify-between"
        style={{ maxWidth: '72rem' }}
      >
        <Link to="/" className="flex items-center min-w-0">
          <span className="font-cyber font-black text-lg tracking-[0.28em] bg-gradient-to-b from-white to-[#d4b075] bg-clip-text text-transparent select-none">
            CONCORDIA
          </span>
        </Link>

        <div className="flex items-center gap-2 md:gap-5 shrink-0">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hidden md:inline text-sm text-neutral-400 hover:text-white transition-colors duration-100"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/editor"
            className="bg-gold hover:bg-gold-light text-neutral-950 px-4 py-2 text-xs md:text-sm font-semibold transition-colors duration-100 shadow"
          >
            Ouvrir l'éditeur
          </Link>
        </div>
      </nav>
      <motion.div
        aria-hidden="true"
        style={{ scaleX, originX: 0 }}
        className="h-[2px] w-full bg-gold"
      />
    </motion.header>
  );
}
