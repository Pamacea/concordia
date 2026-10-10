import { Upload } from 'lucide-react';
import { useRef } from 'react';
import { importChordsFile } from '../features/import/importJson';

interface ImportButtonProps {
  /** Masque le bouton (mode zen) — l'input fichier n'est alors pas monté. */
  hidden?: boolean;
}

/** Bouton « Importer » + input fichier JSON caché qui lui est associé. */
export default function ImportButton({ hidden = false }: ImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void importChordsFile(file);
    e.target.value = '';
  };

  if (hidden) return null;

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3.5 py-2 text-xs md:text-sm font-medium transition-colors border border-neutral-700 shrink-0"
      >
        <Upload size={16} />
        <span className="hidden sm:inline">Importer</span>
      </button>
    </>
  );
}
