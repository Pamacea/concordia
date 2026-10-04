import { PersistedDocSchema, PersistedSettingsSchema } from '../../lib/schemas';
import { DEFAULT_STYLE, useChordsStore } from '../../lib/store/chordsStore';
import { SEED } from '../../data/seed';

export const DOC_STORAGE_KEY = 'concordia:doc:v1';
// v2 : nouveaux défauts de style (fond #0d0d0d, sillet au max…).
// L'ancien v1 est purgé pour que tout le monde reparte des nouveaux défauts.
export const SETTINGS_STORAGE_KEY = 'concordia:settings:v2';
const LEGACY_SETTINGS_STORAGE_KEY = 'concordia:settings:v1';

/**
 * Amorce l'état au démarrage : localStorage (si valide) > seed embarqué.
 * Appelé une fois avant le rendu, dans main.tsx.
 */
export function initializeApp(): void {
  const store = useChordsStore.getState();

  const rawDoc = localStorage.getItem(DOC_STORAGE_KEY);
  if (rawDoc) {
    try {
      const parsed = PersistedDocSchema.parse(JSON.parse(rawDoc));
      store.hydrate(parsed);
    } catch {
      localStorage.removeItem(DOC_STORAGE_KEY);
      store.hydrate(SEED);
    }
  } else {
    store.hydrate(SEED);
  }

  // Purge de l'ancienne clé v1 (les anciens défauts ne doivent plus revenir).
  localStorage.removeItem(LEGACY_SETTINGS_STORAGE_KEY);

  const rawSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (rawSettings) {
    try {
      const parsed = PersistedSettingsSchema.parse(JSON.parse(rawSettings));
      store.updateStyle(parsed.style);
    } catch {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    }
  }
}

/** Purge la persistance et repart du seed embarqué. */
export function resetToSeed(): void {
  localStorage.removeItem(DOC_STORAGE_KEY);
  localStorage.removeItem(SETTINGS_STORAGE_KEY);
  const store = useChordsStore.getState();
  store.updateStyle(DEFAULT_STYLE);
  store.hydrate(SEED);
}
