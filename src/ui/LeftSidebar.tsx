import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { ChevronLeft, FolderPlus } from 'lucide-react';
import { useChordsStore } from '../lib/store/chordsStore';
import GroupSection from './left/GroupSection';
import { useTreeDnd } from './left/useTreeDnd';

/** Cascade d'entrée des groupes : 0,03 s d'écart entre chaque élément. */
const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
};

/** Shell de la sidebar gauche : en-tête + liste des groupes (sections filles). */
export default function LeftSidebar() {
  const groups = useChordsStore((s) => s.groups);
  const addGroup = useChordsStore((s) => s.addGroup);
  const setSidebar = useChordsStore((s) => s.setSidebar);
  const dnd = useTreeDnd();

  return (
    <motion.div
      initial={{ x: -16, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -16, opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="w-72 md:w-60 lg:w-72 bg-neutral-950 border-r border-neutral-800 flex flex-col shrink-0 z-40 md:z-10 absolute md:relative inset-y-0 left-0 shadow-2xl md:shadow-none"
    >
      <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          Groupes & Accords
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={addGroup}
            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors border border-neutral-700 shadow-sm flex items-center justify-center shrink-0"
            title="Nouveau groupe"
          >
            <FolderPlus size={16} className="text-gold" />
          </button>
          <button
            onClick={() => setSidebar('left', false)}
            className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors border border-neutral-700 shadow-sm flex items-center justify-center shrink-0"
            title="Fermer le panneau gauche"
          >
            <ChevronLeft size={16} className="text-gold" />
          </button>
        </div>
      </div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto p-2 space-y-2"
      >
        {groups.map((group) => (
          <GroupSection key={group.id} group={group} canDelete={groups.length > 1} dnd={dnd} />
        ))}
      </motion.div>
    </motion.div>
  );
}
