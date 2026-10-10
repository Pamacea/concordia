import { useState } from 'react';
import { useChordsStore } from '../../lib/store/chordsStore';

/** Élément en cours de glisser-déposer dans l'arbre groupes/accords. */
export type DraggedItem =
  | { type: 'group'; id: string }
  | { type: 'diagram'; id: string; groupId: string };

/** Handlers de drag & drop partagés par les groupes et les lignes d'accord. */
export interface TreeDnd {
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, targetId: string, targetType: 'group' | 'diagram') => void;
  startGroupDrag: (e: React.DragEvent, id: string) => void;
  startDiagramDrag: (e: React.DragEvent, id: string, groupId: string) => void;
}

/** État + handlers du glisser-déposer de la sidebar gauche. */
export function useTreeDnd(): TreeDnd {
  const moveGroup = useChordsStore((s) => s.moveGroup);
  const moveDiagram = useChordsStore((s) => s.moveDiagram);

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

  const startGroupDrag = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    setDraggedItem({ type: 'group', id });
  };

  const startDiagramDrag = (e: React.DragEvent, id: string, groupId: string) => {
    e.stopPropagation();
    setDraggedItem({ type: 'diagram', id, groupId });
  };

  return { handleDragOver, handleDrop, startGroupDrag, startDiagramDrag };
}
