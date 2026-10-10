import type { StyleSettings } from '../../../lib/types';
import ColorField from '../../ColorField';

interface FretNumberSectionProps {
  style: StyleSettings;
  updateStyle: (patch: Partial<StyleSettings>) => void;
}

export default function FretNumberSection({ style, updateStyle }: FretNumberSectionProps) {
  return (
    <div className="space-y-2.5 bg-neutral-900/60 p-2.5 border border-neutral-800">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          Numéros de cases
        </span>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={style.showFretNumbers}
            onChange={(e) => updateStyle({ showFretNumbers: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-10 h-[22px] bg-neutral-800 border border-neutral-600 peer-checked:bg-gold peer-checked:border-gold-light relative transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-[14px] after:w-4 after:bg-neutral-400 after:transition-all after:duration-200 peer-checked:after:translate-x-[18px] peer-checked:after:bg-white" />
        </label>
      </div>

      {style.showFretNumbers && (
        <div className="space-y-2.5 pt-1">
          <ColorField
            label="Couleur du texte"
            value={style.fretNumberColor}
            onChange={(v) => updateStyle({ fretNumberColor: v })}
          />
          <div className="space-y-1.5 px-1.5">
            <span className="text-xs text-neutral-300">
              Taille de police ({style.fretNumberSize}px)
            </span>
            <input
              type="range"
              min="12"
              max="28"
              value={style.fretNumberSize}
              onChange={(e) => updateStyle({ fretNumberSize: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
