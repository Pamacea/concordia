import { Trash2 } from 'lucide-react';
import { useChordsStore } from '../../lib/store/chordsStore';

interface TextActionsProps {
  textId: string;
}

/** Actions sur le texte sélectionné (suppression). */
export default function TextActions({ textId }: TextActionsProps) {
  const deleteText = useChordsStore((s) => s.deleteText);

  return (
    <button
      type="button"
      onClick={() => deleteText(textId)}
      className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-semibold text-red-400 hover:text-white hover:bg-red-600 border border-red-900 hover:border-red-600 transition-colors"
    >
      <Trash2 size={13} />
      Supprimer
    </button>
  );
}
