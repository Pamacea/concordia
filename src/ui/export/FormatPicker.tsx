import type { ExportFormat } from '../../lib/types';

const FORMATS: readonly ExportFormat[] = ['json', 'png', 'svg', 'pdf'];

interface FormatPickerProps {
  format: ExportFormat;
  onChange: (format: ExportFormat) => void;
}

/** Sélecteur de format d'export (json / png / svg / pdf) + note explicative JSON. */
export default function FormatPicker({ format, onChange }: FormatPickerProps) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-xs font-bold text-gold uppercase tracking-wider">
          Format d'export
        </label>
        <div className="grid grid-cols-4 gap-2">
          {FORMATS.map((fmt) => (
            <button
              key={fmt}
              onClick={() => onChange(fmt)}
              className={`py-2 px-2 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-colors ${
                format === fmt
                  ? 'bg-gold border-gold text-neutral-950 shadow'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {format === 'json' && (
        <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-xs text-neutral-400">
          L'exportation en JSON sauvegarde l'intégralité de vos groupes, de vos accords, de leurs
          positions et de leurs paramètres de personnalisation dans un fichier unique.
        </div>
      )}
    </>
  );
}
