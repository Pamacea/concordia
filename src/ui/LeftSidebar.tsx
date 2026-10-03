import { useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Folder,
  FolderOpen,
  FolderPlus,
  GripVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import { useChordsStore } from '../lib/store/chordsStore';

type DraggedItem =
  | { type: 'group'; id: string }
  | { type: 'diagram'; id: string; groupId: string };

export default function LeftSidebar() {
  const groups = useChordsStore((s) => s.groups);
  const diagrams = useChordsStore((s) => s.diagrams);
  const openGroups = useChordsStore((s) => s.openGroups);
  const activeDiagramId = useChordsStore((s) => s.activeDiagramId);
  const toggleGroupOpen = useChordsStore((s) => s.toggleGroupOpen);
  const addGroup = useChordsStore((s) => s.addGroup);
  const deleteGroup = useChordsStore((s) => s.deleteGroup);
  const renameGroup = useChordsStore((s) => s.renameGroup);
  const addDiagram = useChordsStore((s) => s.addDiagram);
  const deleteDiagram = useChordsStore((s) => s.deleteDiagram);
  const setActiveDiagram = useChordsStore((s) => s.setActiveDiagram);
  const setSidebar = useChordsStore((s) => s.setSidebar);
  const moveGroup = useChordsStore((s) => s.moveGroup);
  const moveDiagram = useChordsStore((s) => s.moveDiagram);

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupTitle, setEditingGroupTitle] = useState('');
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string, targetType: 'group' | 'diagram') => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItem) return;

    if (draggedItem.type === 'group' && targetType === 'group') {
      moveGroup(draggedItem.id, targetId);
    } else if (draggedItem.type === 'diagram') {
      moveDiagram(draggedItem.id, draggedItem.groupId, targetId, targetType);
    }

    setDraggedItem(null);
  };

  const commitRename = (gId: string) => {
    renameGroup(gId, editingGroupTitle);
    setEditingGroupId(null);
  };

  return (
    <div className="w-72 md:w-60 lg:w-72 bg-neutral-950 border-r border-neutral-800 flex flex-col shrink-0 z-40 md:z-10 absolute md:relative inset-y-0 left-0 shadow-2xl md:shadow-none">
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

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {groups.map((group) => {
          const isOpen = openGroups[group.id] ?? false;
          const isEditing = editingGroupId === group.id;

          return (
            <div
              key={group.id}
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                setDraggedItem({ type: 'group', id: group.id });
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, group.id, 'group')}
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
                    <input
                      type="text"
                      autoFocus
                      value={editingGroupTitle}
                      onChange={(e) => setEditingGroupTitle(e.target.value)}
                      onBlur={() => commitRename(group.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename(group.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-neutral-800 text-white text-xs px-3 py-1.5 border border-neutral-700 w-full rounded-none"
                    />
                  ) : (
                    <span className="truncate text-neutral-200">{group.name}</span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingGroupId(group.id);
                      setEditingGroupTitle(group.name);
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
                  {groups.length > 1 && (
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
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, group.id, 'group')}
                  className="pl-4 pr-1 py-1 space-y-0.5 border-t border-neutral-800/40 bg-neutral-950/40 min-h-[30px]"
                >
                  {group.diagramIds.map((dId) => {
                    const diag = diagrams[dId];
                    if (!diag) return null;
                    const isActive = activeDiagramId === dId;

                    return (
                      <div
                        key={dId}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          setDraggedItem({ type: 'diagram', id: dId, groupId: group.id });
                        }}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, dId, 'diagram')}
                        onClick={() => {
                          setActiveDiagram(dId);
                          if (window.innerWidth < 768) setSidebar('left', false);
                        }}
                        className={`flex items-center justify-between px-2.5 py-1.5 text-xs cursor-pointer transition-colors group ${
                          isActive
                            ? 'bg-gold/15 text-gold font-semibold border border-gold/30'
                            : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <GripVertical
                            size={12}
                            className="text-neutral-600 cursor-grab shrink-0"
                          />
                          <span className="truncate">{diag.name}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDiagram(dId);
                          }}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
