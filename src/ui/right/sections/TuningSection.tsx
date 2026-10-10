import { TUNINGS } from '../../../lib/theory';
import type { Diagram, TuningId } from '../../../lib/types';
import SectionFrame, { SELECT } from '../../fields/SectionFrame';
import { isTuningId } from '../guards';

interface TuningSectionProps {
  diagram: Diagram | null;
  tuningValue: TuningId;
  setTuning: (tuning: TuningId) => void;
}

export default function TuningSection({ diagram, tuningValue, setTuning }: TuningSectionProps) {
  if (!diagram) return null;

  return (
    <SectionFrame title="Accordage" hint="Corde 6 → corde 1 · propre à ce diagramme">
      <select
        value={tuningValue}
        onChange={(e) => {
          const value = e.target.value;
          if (isTuningId(value)) {
            setTuning(value);
          }
        }}
        className={SELECT}
      >
        {Object.entries(TUNINGS).map(([id, tuning]) => (
          <option key={id} value={id}>
            {tuning.name}
          </option>
        ))}
      </select>
    </SectionFrame>
  );
}
