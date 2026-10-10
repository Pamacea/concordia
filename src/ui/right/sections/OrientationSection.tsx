import type { Diagram, DiagramOrientation } from '../../../lib/types';

interface OrientationSectionProps {
  diagram: Diagram | null;
  setOrientation: (orientation: DiagramOrientation) => void;
}

export default function OrientationSection({ diagram, setOrientation }: OrientationSectionProps) {
  if (!diagram) return null;

  const orientation: DiagramOrientation = diagram.orientation ?? 'vertical';

  return (
    <div className="space-y-1.5 bg-neutral-900/60 p-2.5 border border-neutral-800">
      <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">Orientation</h3>
      <div className="grid grid-cols-2 gap-1 bg-neutral-800 border border-neutral-700 p-1">
        {(['vertical', 'horizontal'] as const).map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setOrientation(o)}
            className={`py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              orientation === o
                ? 'bg-gold text-neutral-950 shadow'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
            }`}
          >
            {o === 'vertical' ? 'Vertical' : 'Horizontal'}
          </button>
        ))}
      </div>
    </div>
  );
}
