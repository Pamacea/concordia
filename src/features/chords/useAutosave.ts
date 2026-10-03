import { useChordsStore } from '../../lib/store/chordsStore';
import { DOC_STORAGE_KEY, SETTINGS_STORAGE_KEY } from './hydrate';

const DEBOUNCE_MS = 500;

/**
 * Sauvegarde automatique (debouncée) du document et du style en localStorage.
 * Retourne une fonction de nettoyage à appeler au démontage.
 */
export function startAutosave(): () => void {
  let docTimer: ReturnType<typeof setTimeout> | undefined;
  let styleTimer: ReturnType<typeof setTimeout> | undefined;

  const unsubscribe = useChordsStore.subscribe((state, prev) => {
    const docChanged =
      state.groups !== prev.groups ||
      state.diagrams !== prev.diagrams ||
      state.openGroups !== prev.openGroups ||
      state.activeDiagramId !== prev.activeDiagramId;

    if (docChanged) {
      clearTimeout(docTimer);
      docTimer = setTimeout(() => {
        const s = useChordsStore.getState();
        localStorage.setItem(
          DOC_STORAGE_KEY,
          JSON.stringify({
            schemaVersion: 1,
            groups: s.groups,
            diagrams: s.diagrams,
            openGroups: s.openGroups,
            activeDiagramId: s.activeDiagramId,
          }),
        );
      }, DEBOUNCE_MS);
    }

    if (state.style !== prev.style) {
      clearTimeout(styleTimer);
      styleTimer = setTimeout(() => {
        const s = useChordsStore.getState();
        localStorage.setItem(
          SETTINGS_STORAGE_KEY,
          JSON.stringify({ schemaVersion: 1, style: s.style }),
        );
      }, DEBOUNCE_MS);
    }
  });

  return () => {
    unsubscribe();
    clearTimeout(docTimer);
    clearTimeout(styleTimer);
  };
}
