import type { BottomIndicatorType } from '../../../lib/types';
import SectionFrame, { SELECT } from '../../fields/SectionFrame';
import { toBottomIndicatorType } from '../guards';

interface BottomIndicatorSectionProps {
  value: BottomIndicatorType;
  onChange: (indicator: BottomIndicatorType) => void;
}

export default function BottomIndicatorSection({ value, onChange }: BottomIndicatorSectionProps) {
  return (
    <SectionFrame title="Indicateurs sous la touche">
      <select
        value={value}
        onChange={(e) => onChange(toBottomIndicatorType(e.target.value))}
        className={SELECT}
      >
        <option value="notes">Note</option>
        <option value="fingerings">Doigtés Personnalisés</option>
        <option value="intervals">Intervals / Degrés</option>
        <option value="none">Aucun</option>
      </select>
    </SectionFrame>
  );
}
