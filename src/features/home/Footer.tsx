import { Link } from 'react-router-dom';

/** Pied de page de la landing : marque, copyright, accès éditeur. */
export default function Footer() {
  return (
    <footer className="border-t border-neutral-800">
      <div
        className="mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ maxWidth: '72rem' }}
      >
        <span className="font-cyber font-black text-sm tracking-[0.28em] text-neutral-500">
          CONCORDIA
        </span>

        <nav aria-label="Liens du pied de page" className="flex items-center gap-5">
          <a
            href="#fonctionnalites"
            className="text-xs text-neutral-500 hover:text-white transition-colors"
          >
            Fonctionnalités
          </a>
        </nav>

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
  );
}
