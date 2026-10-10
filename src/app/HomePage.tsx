import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/** Page d'accueil — route `/`. */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* Navbar : marque à gauche, navigation à droite */}
      <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
        <nav
          className="mx-auto w-full px-6 h-16 flex items-center justify-between"
          style={{ maxWidth: '72rem' }}
        >
          <Link to="/" className="flex items-center min-w-0">
            <span className="font-cyber font-black text-lg tracking-[0.28em] bg-gradient-to-b from-white to-[#d4b075] bg-clip-text text-transparent select-none">
              CONCORDIA
            </span>
          </Link>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <Link
              to="/editor"
              className="bg-gold hover:bg-gold-light text-neutral-950 px-4 py-2 text-xs md:text-sm font-semibold transition-colors shadow"
            >
              Éditeur
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-neutral-800">
          <div
            className="mx-auto px-6 py-24 md:py-32 text-center"
            style={{ maxWidth: '48rem' }}
          >
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.3em] text-gold border border-neutral-800 bg-neutral-900/60 px-3 py-1.5">
              Créateur de diagrammes
            </span>
            <h1 className="font-cyber font-black text-4xl md:text-6xl tracking-tight mt-6 bg-gradient-to-b from-white to-[#d4b075] bg-clip-text text-transparent">
              CONCORDIA
            </h1>
            <p className="mt-6 text-neutral-400 text-base md:text-lg leading-relaxed">
              Dessinez des diagrammes d'accord de guitare nets et personnalisables —
              accordage par diagramme, indicateurs de notes ou d'intervalles, export en
              un clic.
            </p>
            <Link
              to="/editor"
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-neutral-950 px-7 py-3.5 mt-9 text-sm font-semibold transition-colors shadow"
            >
              Créer maintenant
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800">
        <div
          className="mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ maxWidth: '72rem' }}
        >
          <span className="font-cyber font-black text-sm tracking-[0.28em] text-neutral-500">
            CONCORDIA
          </span>
          <p className="text-xs text-neutral-500">
            © 2026 Concordia — Créateur de diagrammes de guitare
          </p>
          <Link
            to="/editor"
            className="text-xs font-bold uppercase tracking-wider text-gold hover:text-gold-light transition-colors"
          >
            Ouvrir l'éditeur
          </Link>
        </div>
      </footer>
    </div>
  );
}
