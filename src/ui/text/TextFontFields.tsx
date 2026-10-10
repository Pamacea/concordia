import { Bold } from 'lucide-react';
import { diagramLayout, freeTextMetrics } from '../../lib/geometry';
import { useChordsStore } from '../../lib/store/chordsStore';
import type { FreeText } from '../../lib/types';
import ColorField from '../ColorField';

/**
 * Polices système uniquement : l'export PNG/PDF passe par un blob SVG
 * qui ne charge pas les polices web (Google Fonts) à l'exécution.
 */
const FONT_CHOICES = [
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times', value: "'Times New Roman', Times, serif" },
  { label: 'Courier', value: "'Courier New', monospace" },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet', value: "'Trebuchet MS', sans-serif" },
  { label: 'Impact', value: 'Impact' },
] as const;

const MIN_SIZE = 10;
const MAX_SIZE = 120;

interface TextFontFieldsProps {
  text: FreeText;
}

/** Champs police, taille, gras et couleur du texte sélectionné. */
export default function TextFontFields({ text }: TextFontFieldsProps) {
  const activeDiagramId = useChordsStore((s) => s.activeDiagramId);
  const diagrams = useChordsStore((s) => s.diagrams);
  const style = useChordsStore((s) => s.style);
  const updateText = useChordsStore((s) => s.updateText);

  const diagram = activeDiagramId ? diagrams[activeDiagramId] : null;
  if (!diagram) return null;

  const layout = diagramLayout(diagram, style);
  const metrics = freeTextMetrics(text, layout.width, layout.horizontal);
  const size = text.fontSize ?? metrics.size;

  return (
    <>
      <div className="space-y-1.5">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
          Police
        </span>
        <select
          value={text.fontFamily ?? FONT_CHOICES[0].value}
          onChange={(e) => updateText(text.id, { fontFamily: e.target.value })}
          className="w-full bg-neutral-900 border border-neutral-800 px-2 py-1.5 text-sm text-neutral-200 focus:outline-none focus:border-gold"
        >
          {FONT_CHOICES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1.5">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Taille (px)
          </span>
          <input
            type="number"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={size}
            onChange={(e) => {
              // Pas de clamp bas pendant la frappe : « 40 » deviendrait « 10 »+« 0 » → 100.
              const v = parseInt(e.target.value, 10);
              if (!Number.isNaN(v)) {
                updateText(text.id, { fontSize: Math.min(MAX_SIZE, v) });
              }
            }}
            onBlur={(e) => {
              const v = parseInt(e.target.value, 10);
              const clamped = Number.isNaN(v)
                ? MIN_SIZE
                : Math.max(MIN_SIZE, Math.min(MAX_SIZE, v));
              if (clamped !== v) updateText(text.id, { fontSize: clamped });
            }}
            className="w-full bg-neutral-900 border border-neutral-800 px-2 py-1.5 text-sm text-neutral-200 focus:outline-none focus:border-gold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <button
          type="button"
          onClick={() => updateText(text.id, { bold: !(text.bold !== false) })}
          title="Gras"
          className={`shrink-0 p-2 border transition-colors ${
            text.bold !== false
              ? 'bg-gold border-gold text-neutral-950'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600'
          }`}
        >
          <Bold size={14} />
        </button>
      </div>

      <ColorField
        label="Couleur"
        value={text.color ?? '#ffffff'}
        onChange={(v) => updateText(text.id, { color: v })}
      />
    </>
  );
}
