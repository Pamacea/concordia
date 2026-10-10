import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Maximize2, Minimize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useChordsStore } from '../lib/store/chordsStore';
import ImportButton from './ImportButton';

interface TopBarProps {
  onOpenExport: () => void;
}

export default function TopBar({ onOpenExport }: TopBarProps) {
  const activeDiagramId = useChordsStore((s) => s.activeDiagramId);
  const diagrams = useChordsStore((s) => s.diagrams);
  const groups = useChordsStore((s) => s.groups);
  const updateActiveDiagram = useChordsStore((s) => s.updateActiveDiagram);
  const setActiveDiagram = useChordsStore((s) => s.setActiveDiagram);
  const setSidebar = useChordsStore((s) => s.setSidebar);
  const leftSidebarOpen = useChordsStore((s) => s.leftSidebarOpen);
  const rightSidebarOpen = useChordsStore((s) => s.rightSidebarOpen);

  /** Mode zen : état local + fermeture des deux sidebars (réouverture = sortie). */
  const [zen, setZen] = useState(false);
  const zenActive = zen && !leftSidebarOpen && !rightSidebarOpen;
  const toggleZen = () => {
    const next = !zenActive;
    setZen(next);
    setSidebar('left', !next);
    setSidebar('right', !next);
  };

  const diagram = activeDiagramId ? (diagrams[activeDiagramId] ?? null) : null;

  /** Navigation entre diagrammes (liste ordonnée) — pour téléphone sans panneau. */
  const orderedIds = groups.flatMap((g) => g.diagramIds);
  const stepDiagram = (dir: -1 | 1) => {
    if (orderedIds.length < 2 || !activeDiagramId) return;
    const idx = orderedIds.indexOf(activeDiagramId);
    const next = (idx + dir + orderedIds.length) % orderedIds.length;
    setActiveDiagram(orderedIds[next]);
  };

  return (
    <div
      data-focus-zone="top"
      className="h-16 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-3 md:px-5 z-25 shrink-0 relative"
    >
      {/* Section gauche : nom → retour accueil */}
      <div className="flex items-center justify-start py-1 z-10">
        <Link
          to="/"
          title="Retour à l'accueil"
          className="hidden sm:inline font-cyber font-black text-lg md:text-2xl tracking-[0.28em] bg-gradient-to-b from-white to-[#d4b075] bg-clip-text text-transparent select-none whitespace-nowrap hover:opacity-80 transition-opacity"
        >
          CONCORDIA
        </Link>
      </div>

      {/* Titre centré dans l'espace restant (jamais par-dessus logo/boutons) */}
      <div className="flex-1 min-w-0 px-2 flex items-center justify-center">
        {diagram && (
          <div className="flex items-stretch gap-1.5 min-w-0" style={{ maxWidth: '100%' }}>
            {!zenActive && (
              <button
                onClick={() => stepDiagram(-1)}
                disabled={orderedIds.length < 2}
                title="Accord précédent"
                className="flex items-center justify-center px-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-gold border border-neutral-800 transition-colors shrink-0 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft size={16} />
              </button>
            )}

            <div className="flex items-center gap-2 bg-neutral-900/90 px-3.5 py-1.5 border border-neutral-800 shadow-inner focus-within:border-gold transition-colors rounded-none min-w-0 overflow-hidden">
              <span className="hidden lg:inline text-[11px] font-bold text-gold uppercase tracking-wider">
                Titre
              </span>
              <div className="hidden lg:block w-px h-4 bg-neutral-800" />
              <input
                type="text"
                value={diagram.name}
                onChange={(e) => updateActiveDiagram((d) => ({ ...d, name: e.target.value }))}
                className="bg-transparent text-white text-sm lg:text-base px-2 lg:px-3 py-1 focus:outline-none w-28 sm:w-36 lg:w-60 min-w-0 font-semibold tracking-wide placeholder:text-neutral-600 rounded-none"
                placeholder="Nom de l'accord..."
              />
            </div>

            {!zenActive && (
              <button
                onClick={() => stepDiagram(1)}
                disabled={orderedIds.length < 2}
                title="Accord suivant"
                className="flex items-center justify-center px-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-gold border border-neutral-800 transition-colors shrink-0 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Actions droite */}
      <div className="flex items-center gap-2 md:gap-3 justify-end shrink-0 z-10">
        <button
          type="button"
          onClick={toggleZen}
          aria-pressed={zenActive}
          title={zenActive ? 'Quitter le mode zen' : 'Activer le mode zen'}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium transition-colors border shrink-0 ${
            zenActive
              ? 'bg-gold/15 border-gold text-gold'
              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
          }`}
        >
          {zenActive ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          <span className="hidden sm:inline">Mode zen</span>
        </button>

        <ImportButton hidden={zenActive} />

        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 bg-gold hover:bg-gold-light text-neutral-950 px-4 py-2 text-xs md:text-sm font-semibold transition-colors shadow shrink-0"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Exporter</span>
        </button>
      </div>
    </div>
  );
}
