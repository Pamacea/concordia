import { MAX_FRETS, MAX_FRET, MIN_FRETS, diagramFrets } from '../../../lib/geometry';
import type { Diagram, StyleSettings } from '../../../lib/types';
import StepperInput from '../../fields/StepperInput';

interface FretSectionProps {
  diagram: Diagram | null;
  style: StyleSettings;
  setStartFret: (fret: number) => void;
  setFretCount: (count: number) => void;
}

export default function FretSection({
  diagram,
  style,
  setStartFret,
  setFretCount,
}: FretSectionProps) {
  if (!diagram) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-1.5 bg-neutral-900/60 p-2.5 border border-neutral-800">
        <h3 className="h-7 text-[11px] font-bold text-gold uppercase tracking-wider leading-tight">
          Case de départ
        </h3>
        <StepperInput
          value={diagram.startFret || 1}
          min={1}
          max={MAX_FRET}
          onChange={setStartFret}
        />
        <span className="block text-[10px] text-neutral-500 font-medium">
          Sillet · 1–{MAX_FRET}
        </span>
      </div>

      <div className="space-y-1.5 bg-neutral-900/60 p-2.5 border border-neutral-800">
        <h3 className="h-7 text-[11px] font-bold text-gold uppercase tracking-wider leading-tight">
          Nombre de frettes
        </h3>
        <StepperInput
          value={diagramFrets(diagram, style)}
          min={MIN_FRETS}
          max={MAX_FRETS}
          onChange={setFretCount}
        />
        <span className="block text-[10px] text-neutral-500 font-medium">
          Affichées · {MIN_FRETS}–{MAX_FRETS}
        </span>
      </div>
    </div>
  );
}
