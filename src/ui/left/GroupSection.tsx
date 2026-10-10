import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Folder,
  FolderOpen,
  GripVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import { useChordsStore } from '../../lib/store/chordsStore';
import type { Group } from '../../lib/types';
import DiagramRow from './DiagramRow';
import RenameInline from './RenameInline';
import type { TreeDnd } from './useTreeDnd';

/** Apparition d'un groupe dans la cascade de la sidebar. */
const groupVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
};

/** Cascade des diagrammes à l'ouverture du groupe (0,03 s d'écart). */
const diagramListVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
};

interface GroupSectionProps {
  group: Group;
  /** Vrai s'il reste au moins un autre groupe (le dernier ne se supprime pas). */
  canDelete: boolean;
  dnd: TreeDnd;
}

/** Section de groupe : en-tête (ouvrir, renommer, actions) + boucle de ses diagrammes. */
export default function GroupSection({ group, canDelete, dnd }: GroupSectionProps) {
  const openGroups = useChordsStore((s) => s.openGroups);
  const activeDiagramId = useChordsStore((s) => s.activeDiagramId);
  const toggleGroupOpen = useChordsStore((s) => s.toggleGroupOpen);
  const addDiagram = useChordsStore((s) => s.addDiagram);
  const deleteGroup = useChordsStore((s) => s.deleteGroup);
  const renameGroup = useChordsStore((s) => s.renameGroup);

  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');

  const isOpen = openGroups[group.id] ?? false;

  const commitRename = () => {
    renameGroup(group.id, editingTitle);
    setIsEditing(false);
  };

  // motion redéfinit le type de `onDragStart` (geste pan) ; comme `draggable` est posé, il route
  // néanmoins l'event vers le DOM — on bridge donc uniquement le type, le runtime reste natif.
  return (
    <motion.div
      variants={groupVariants}
      draggable
      onDragStart={(e) => dnd.startGroupDrag(e as unknown as React.DragEvent, group.id)}
      onDragOver={dnd.handleDragOver}
      onDrop={(e) => dnd.handleDrop(e, group.id, 'group')}
      className="bg-neutral-900/50 border border-neutral-800/80 overflow-hidden"
    >
      <div className="flex items-center justify-between p-2 hover:bg-neutral-800/50 cursor-pointer text-sm font-medium">
        <div
          className="flex items-center gap-2 overflow-hidden flex-1"
          onClick={() => toggleGroupOpen(group.id)}
        >
          <GripVertical size={14} className="text-neutral-600 cursor-grab shrink-0" />
          <button className="text-neutral-400 hover:text-white">
            {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
          {isOpen ? (
            <FolderOpen size={16} className="text-gold shrink-0" />
          ) : (
            <Folder size={16} className="text-neutral-500 shrink-0" />
          )}
          {isEditing ? (
            <RenameInline
              value={editingTitle}
              onValueChange={setEditingTitle}
              onCommit={commitRename}
            />
          ) : (
            <span className="truncate text-neutral-200">{group.name}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
              setEditingTitle(group.name);
            }}
            className="p-1 hover:text-gold text-neutral-500"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addDiagram(group.id);
            }}
            className="p-1 hover:text-green-400 text-neutral-500"
            title="Ajouter un accord"
          >
            <Plus size={14} />
          </button>
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteGroup(group.id);
              }}
              className="p-1 hover:text-red-400 text-neutral-500"
              title="Supprimer le groupe"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <motion.div
          variants={diagramListVariants}
          initial="hidden"
          animate="show"
          onDragOver={dnd.handleDragOver}
          onDrop={(e) => dnd.handleDrop(e, group.id, 'group')}
          className="pl-4 pr-1 py-1 space-y-0.5 border-t border-neutral-800/40 bg-neutral-950/40 min-h-[30px]"
        >
          {group.diagramIds.map((dId) => (
            <DiagramRow
              key={dId}
              diagramId={dId}
              groupId={group.id}
              isActive={activeDiagramId === dId}
              dnd={dnd}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
