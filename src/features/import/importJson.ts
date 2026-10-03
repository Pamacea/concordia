import { ChordsFileSchema } from '../../lib/schemas';
import { useChordsStore } from '../../lib/store/chordsStore';

/**
 * Lit un fichier JSON d'accords, le valide (Zod) puis remplace le document courant.
 * Frontière : fichier utilisateur → échec = toast, état inchangé.
 */
export const importChordsFile = async (file: File): Promise<void> => {
  const { hydrate, showToast } = useChordsStore.getState();

  let json: unknown;
  try {
    json = JSON.parse(await file.text());
  } catch {
    showToast('Erreur lors de la lecture du fichier JSON.', 'error');
    return;
  }

  const parsed = ChordsFileSchema.safeParse(json);
  if (!parsed.success) {
    showToast('Format JSON invalide.', 'error');
    return;
  }

  hydrate(parsed.data);
  showToast('Importation JSON réussie !', 'success');
};
