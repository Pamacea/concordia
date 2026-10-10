import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CHORDS = 'Am · C · G · D · Em · F · Dm · A7 · G7 · Cmaj7 · ';

/** Bande finale : marquee de noms d'accords derrière titre + CTA or. */
export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-neutral-800 py-24 text-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center pointer-events-none select-none"
      >
        <div className="marquee flex w-max whitespace-nowrap">
          <span className="font-cyber font-black text-6xl md:text-8xl text-neutral-800 px-4">
            {CHORDS.repeat(4)}
          </span>
          <span className="font-cyber font-black text-6xl md:text-8xl text-neutral-800 px-4">
            {CHORDS.repeat(4)}
          </span>
        </div>
      </div>

      <div className="relative px-6">
        <h2 className="font-cyber font-black text-2xl md:text-4xl text-white">
          Prêt à dessiner votre premier accord ?
        </h2>
        <Link
          to="/editor"
          className="mt-8 inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-neutral-950 px-7 py-3.5 text-sm font-semibold transition-colors duration-100 shadow"
        >
          Créer mon premier diagramme
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
