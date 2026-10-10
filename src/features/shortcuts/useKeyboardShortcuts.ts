import { useEffect } from 'react';
import { useChordsStore } from '../../lib/store/chordsStore';
import type { Tool } from '../../lib/types';

const KEY_TOOLS: Record<string, Tool> = {
  p: 'pointer',
  n: 'note',
  t: 'text',
  g: 'eraser',
};

/** Éléments focusables pris en compte dans le cycle Tab. */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Cible focusable pour laquelle Tab garde son comportement natif :
 * champs de saisie, boutons (déjà « focusables » par le navigateur) et liens.
 */
const keepsNativeTab = (t: EventTarget | null): boolean =>
  t instanceof HTMLInputElement ||
  t instanceof HTMLTextAreaElement ||
  t instanceof HTMLSelectElement ||
  t instanceof HTMLButtonElement ||
  t instanceof HTMLAnchorElement ||
  (t instanceof HTMLElement && t.isContentEditable);

/** Focusables visibles d'une racine (`getClientRects` exclut le display:none). */
const focusablesIn = (root: ParentNode): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute('disabled') && el.getClientRects().length > 0,
  );

/**
 * Trois zones de navigation : panneau gauche → canvas → panneau droit.
 * La zone canvas est déclarée par CanvasArea ; les panneaux latéraux sont
 * reconnus par leur position dans le DOM (aucun composant à modifier).
 */
const collectZones = (): HTMLElement[][] => {
  const canvas = document.querySelector<HTMLElement>('[data-focus-zone="canvas"]');
  if (!canvas) return [];
  const top = document.querySelector<HTMLElement>('[data-focus-zone="top"]');

  const left: HTMLElement[] = [];
  const middle: HTMLElement[] = [];
  const right: HTMLElement[] = [];

  for (const el of focusablesIn(document.body)) {
    if (top?.contains(el)) continue;
    if (canvas.contains(el)) middle.push(el);
    else if (canvas.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING) left.push(el);
    else right.push(el);
  }
  return [left, middle, right];
};

/** Focus le premier (sens positif) ou le dernier élément d'une zone. */
const focusZone = (els: HTMLElement[], dir: number): boolean => {
  const target = dir > 0 ? els[0] : els[els.length - 1];
  if (!target) return false;
  target.focus();
  return true;
};

/** Cycle LeftSidebar → canvas → RightSidebar. Retourne vrai si le focus a bougé. */
const cycleZone = (dir: 1 | -1): boolean => {
  const zones = collectZones();
  if (zones.length === 0) return false;

  const active = document.activeElement;
  let current = -1;
  zones.forEach((els, i) => {
    if (active instanceof HTMLElement && els.includes(active)) current = i;
  });

  // Hors zone : on démarre sur la première (Tab) ou la dernière (Shift+Tab).
  const outside = current === -1;
  const base = outside ? (dir > 0 ? -1 : 0) : current;
  const steps = outside ? zones.length : zones.length - 1;
  for (let step = 1; step <= steps; step++) {
    const idx = (base + step * dir + step * zones.length) % zones.length;
    if (focusZone(zones[idx], dir)) return true;
  }
  return false;
};

/** Raccourcis globaux : outils P / N / T / G + cycle Tab entre les panneaux. */
export function useKeyboardShortcuts(): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (keepsNativeTab(e.target)) return;
        if (cycleZone(e.shiftKey ? -1 : 1)) e.preventDefault();
        return;
      }

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
