import type { Diagram, NutIndicatorType } from '../../../lib/types';
import SectionFrame, { SELECT } from '../../fields/SectionFrame';
import { toNutIndicatorType } from '../guards';

interface NutIndicatorSectionProps {
  diagram: Diagram | null;
  setNutIndicator: (indicator: NutIndicatorType) => void;
}

export default function NutIndicatorSection({
  diagram,
  setNutIndicator,
}: NutIndicatorSectionProps) {
  if (!diagram) return null;

  return (
    <SectionFrame
      title="Indicateurs dessus le sillet"
      hint="Note de la corde à vide, au-dessus des ○ / ×"
    >
      <select
        value={diagram.nutIndicator ?? 'none'}
        onChange={(e) => setNutIndicator(toNutIndicatorType(e.target.value))}
        className={SELECT}
      >
        <option value="notes">Accordage</option>
        <option value="none">Aucun</option>
      </select>
    </SectionFrame>
  );
}
