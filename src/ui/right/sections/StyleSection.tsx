import { Palette } from 'lucide-react';
import type { StyleSettings } from '../../../lib/types';
import ColorField from '../../ColorField';
import SliderPair from '../../fields/SliderPair';

interface StyleSectionProps {
  style: StyleSettings;
  updateStyle: (patch: Partial<StyleSettings>) => void;
}

export default function StyleSection({ style, updateStyle }: StyleSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
        <Palette size={14} /> Style du Diagramme
      </h3>

      <ColorField
        label="Couleur de fond"
        value={style.diagramBgColor}
        onChange={(v) => updateStyle({ diagramBgColor: v })}
      />
      <ColorField
        label="Couleur du sillet"
        value={style.nutColor}
        onChange={(v) => updateStyle({ nutColor: v })}
      />

      <SliderPair
        label="Sillet de tête (Épaisseur & Opacité)"
        min1={2}
        max1={16}
        value1={style.nutThickness}
        onChange1={(v) => updateStyle({ nutThickness: v })}
        min2={10}
        max2={100}
        value2={style.nutOpacity}
        onChange2={(v) => updateStyle({ nutOpacity: v })}
      />

      <SliderPair
        label="Cordes (Épaisseur & Opacité)"
        min1={1}
        max1={8}
        value1={style.stringThicknessBase}
        onChange1={(v) => updateStyle({ stringThicknessBase: v })}
        min2={10}
        max2={100}
        value2={style.stringOpacity}
        onChange2={(v) => updateStyle({ stringOpacity: v })}
      />

      <SliderPair
        label="Frettes (Épaisseur & Opacité)"
        min1={1}
        max1={8}
        value1={style.fretThickness}
        onChange1={(v) => updateStyle({ fretThickness: v })}
        min2={10}
        max2={100}
        value2={style.fretOpacity}
        onChange2={(v) => updateStyle({ fretOpacity: v })}
      />
    </div>
  );
}
