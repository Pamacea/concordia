import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { GripVertical, Trash2 } from 'lucide-react';
import { useChordsStore } from '../../lib/store/chordsStore';
import type { TreeDnd } from './useTreeDnd';

/** Apparition d'une ligne d'accord dans la cascade de son groupe. */
const rowVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
};

interface DiagramRowProps {
  diagramId: string;
  groupId: string;
  isActive: boolean;
  dnd: TreeDnd;
}

/** Ligne d'accord : grip de drag, sélection au clic, suppression. */
export default function DiagramRow({ diagramId, groupId, isActive, dnd }: DiagramRowProps) {
  const diagrams = useChordsStore((s) => s.diagrams);
  const deleteDiagram = useChordsStore((s) => s.deleteDiagram);
  const setActiveDiagram = useChordsStore((s) => s.setActiveDiagram);
  const setSidebar = useChordsStore((s) => s.setSidebar);

  const diag = diagrams[diagramId];
  if (!diag) return null;

  // motion redéfinit le type de `onDragStart` (geste pan) ; comme `draggable` est posé, il route
  // néanmoins l'event vers le DOM — on bridge donc uniquement le type, le runtime reste natif.
  return (
    <motion.div
      variants={rowVariants}
      draggable
      onDragStart={(e) => dnd.startDiagramDrag(e as unknown as React.DragEvent, diagramId, groupId)}
      onDragOver={dnd.handleDragOver}
      onDrop={(e) => dnd.handleDrop(e, diagramId, 'diagram')}
      onClick={() => {
        setActiveDiagram(diagramId);
        if (window.innerWidth < 768) setSidebar('left', false);
      }}
      className={`flex items-center justify-between px-2.5 py-1.5 text-xs cursor-pointer transition-colors group ${
        isActive
          ? 'ants bg-gold/15 text-gold font-semibold border border-gold/30'
          : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
      }`}
    >
      <div className="flex items-center gap-1.5 truncate">
        <GripVertical size={12} className="text-neutral-600 cursor-grab shrink-0" />
        <span className="truncate">{diag.name}</span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteDiagram(diagramId);
        }}
        className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 transition-opacity"
      >
        <Trash2 size={12} />
      </button>
    </motion.div>
  );
}
