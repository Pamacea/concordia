import { useEffect } from 'react';
import { useChordsStore } from '../../lib/store/chordsStore';
import type { Tool } from '../../lib/types';

const KEY_TOOLS: Record<string, Tool> = {
  p: 'pointer',
  n: 'note',
  t: 'text',
  g: 'eraser',
};

/** Raccourcis globaux P / N / T / G (ignorés dans les champs de saisie). */
export function useKeyboardShortcuts(): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      if (target instanceof HTMLSelectElement) return;
      if (target instanceof HTMLElement && target.isContentEditable) return;

      const tool = KEY_TOOLS[e.key.toLowerCase()];
      if (tool) useChordsStore.getState().setActiveTool(tool);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
