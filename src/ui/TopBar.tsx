import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Download, Upload } from 'lucide-react';
import { importChordsFile } from '../features/import/importJson';
import { useChordsStore } from '../lib/store/chordsStore';

interface TopBarProps {
  onOpenExport: () => void;
}

export default function TopBar({ onOpenExport }: TopBarProps) {
  const activeDiagramId = useChordsStore((s) => s.activeDiagramId);
  const diagrams = useChordsStore((s) => s.diagrams);
  const groups = useChordsStore((s) => s.groups);
  const updateActiveDiagram = useChordsStore((s) => s.updateActiveDiagram);
  const setActiveDiagram = useChordsStore((s) => s.setActiveDiagram);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const diagram = activeDiagramId ? (diagrams[activeDiagramId] ?? null) : null;

  /** Navigation entre diagrammes (liste ordonnée) — pour téléphone sans panneau. */
  const orderedIds = groups.flatMap((g) => g.diagramIds);
  const stepDiagram = (dir: -1 | 1) => {
    if (orderedIds.length < 2 || !activeDiagramId) return;
    const idx = orderedIds.indexOf(activeDiagramId);
    const next = (idx + dir + orderedIds.length) % orderedIds.length;
    setActiveDiagram(orderedIds[next]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void importChordsFile(file);
    e.target.value = '';
  };

  return (
    <div className="h-16 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-3 md:px-5 z-25 shrink-0 relative">
      {/* Section gauche : logo + nom */}
      <div className="flex items-center gap-2.5 md:gap-3 justify-start py-1 z-10">
        <img
          src="/concordia-padded.png"
          alt=""
          width={675}
          height={704}
          className="hidden sm:block h-11 w-auto shrink-0"
        />
        <span className="hidden sm:inline font-cyber font-black text-lg md:text-2xl tracking-[0.28em] bg-gradient-to-b from-white to-[#d4b075] bg-clip-text text-transparent select-none whitespace-nowrap">
          CONCORDIA
        </span>
      </div>

      {/* Titre centré dans l'espace restant (jamais par-dessus logo/boutons) */}
      <div className="flex-1 min-w-0 px-2 flex items-center justify-center">
        {diagram && (
          <div className="flex items-stretch gap-1.5 max-w-full min-w-0">
            <button
              onClick={() => stepDiagram(-1)}
              disabled={orderedIds.length < 2}
              title="Accord précédent"
              className="flex items-center justify-center px-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-gold border border-neutral-800 transition-colors shrink-0 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-2 bg-neutral-900/90 px-3.5 py-1.5 border border-neutral-800 shadow-inner focus-within:border-gold transition-colors rounded-none min-w-0 overflow-hidden">
              <span className="hidden lg:inline text-[11px] font-bold text-gold uppercase tracking-wider">
                Titre
              </span>
              <div className="hidden lg:block w-px h-4 bg-neutral-800"></div>
              <input
                type="text"
                value={diagram.name}
                onChange={(e) =>
                  updateActiveDiagram((d) => ({ ...d, name: e.target.value }))
                }
                className="bg-transparent text-white text-sm lg:text-base px-2 lg:px-3 py-1 focus:outline-none w-28 sm:w-36 lg:w-60 min-w-0 font-semibold tracking-wide placeholder:text-neutral-600 rounded-none"
                placeholder="Nom de l'accord..."
              />
            </div>

            <button
              onClick={() => stepDiagram(1)}
              disabled={orderedIds.length < 2}
              title="Accord suivant"
              className="flex items-center justify-center px-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-gold border border-neutral-800 transition-colors shrink-0 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Actions droite */}
      <div className="flex items-center gap-2 md:gap-3 justify-end shrink-0 z-10">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".json"
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3.5 py-2 text-xs md:text-sm font-medium transition-colors border border-neutral-700 shrink-0"
        >
          <Upload size={16} />
          <span className="hidden sm:inline">Importer</span>
        </button>

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
