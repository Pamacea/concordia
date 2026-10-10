import { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { startAutosave } from '../features/chords/useAutosave';
import { useKeyboardShortcuts } from '../features/shortcuts/useKeyboardShortcuts';
import CanvasArea from '../ui/CanvasArea';
import ExportModal from '../ui/ExportModal';
import LeftSidebar from '../ui/LeftSidebar';
import RightSidebar from '../ui/RightSidebar';
import Toast from '../ui/Toast';
import TopBar from '../ui/TopBar';
import { useChordsStore } from '../lib/store/chordsStore';

/** Éditeur de diagrammes — route `/editor`. */
export default function EditorPage() {
  const leftSidebarOpen = useChordsStore((s) => s.leftSidebarOpen);
  const rightSidebarOpen = useChordsStore((s) => s.rightSidebarOpen);
  const setSidebar = useChordsStore((s) => s.setSidebar);

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(() => window.innerWidth < 768);

  useKeyboardShortcuts();
  useEffect(() => startAutosave(), []);

  /** Les sidebars overlay se ferment/retrouvent selon la largeur. */
  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /** Format téléphone → panels fermés (consultation seule) ; large → ouverts. */
  useEffect(() => {
    setSidebar('left', !isNarrow);
    setSidebar('right', !isNarrow);
  }, [isNarrow, setSidebar]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="h-screen w-screen bg-neutral-900 text-white flex flex-col overflow-hidden">
        <Toast />
        <TopBar onOpenExport={() => setExportModalOpen(true)} />

        <div className="flex-1 flex overflow-hidden relative">
          <AnimatePresence>{leftSidebarOpen && <LeftSidebar key="left-sidebar" />}</AnimatePresence>
          <CanvasArea />
          {/* Wrapper de mise en page : largeur = celle du panneau, pile (z) au-dessus du voile mobile. */}
          <AnimatePresence>
            {rightSidebarOpen && (
              <motion.div
                key="right-sidebar"
                initial={{ x: 16, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 16, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="flex shrink-0 z-40 md:z-10"
              >
                <RightSidebar />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fond modal : ferme les sidebars overlay en mobile */}
          {isNarrow && (leftSidebarOpen || rightSidebarOpen) && (
            <div
              className="absolute inset-0 bg-black/60 z-[35] md:hidden"
              onClick={() => {
                setSidebar('left', false);
                setSidebar('right', false);
              }}
            />
          )}

          {/* Onglets de réouverture des panneaux fermés (masqués en format téléphone) */}
          {!leftSidebarOpen && (
            <button
              onClick={() => setSidebar('left', true)}
              title="Ouvrir le panneau gauche"
              className="hidden md:block absolute left-0 top-0 z-20 p-2.5 bg-neutral-950/90 border border-t-0 border-neutral-800 border-l-0 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shadow-xl"
            >
              <ChevronRight size={16} />
            </button>
          )}
          {!rightSidebarOpen && (
            <button
              onClick={() => setSidebar('right', true)}
              title="Ouvrir le panneau droit"
              className="hidden md:block absolute right-0 top-0 z-20 p-2.5 bg-neutral-950/90 border border-t-0 border-neutral-800 border-r-0 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shadow-xl"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* AnimatePresence doit vivre ici : le modal est démonté par ce conditional. */}
        <AnimatePresence>
          {exportModalOpen && (
            <ExportModal key="export-modal" onClose={() => setExportModalOpen(false)} />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
