interface SliderPairProps {
  label: string;
  min1: number;
  max1: number;
  value1: number;
  onChange1: (v: number) => void;
  min2: number;
  max2: number;
  value2: number;
  onChange2: (v: number) => void;
}

export default function SliderPair({
  label,
  min1,
  max1,
  value1,
  onChange1,
  min2,
  max2,
  value2,
  onChange2,
}: SliderPairProps) {
  return (
    <div className="space-y-3 bg-neutral-900/60 p-3 border border-neutral-800">
      <span className="block text-xs font-bold text-white uppercase tracking-wider">{label}</span>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-neutral-500 w-16 shrink-0 uppercase tracking-wide">
            Épaisseur
          </span>
          <input
            type="range"
            min={min1}
            max={max1}
            value={value1}
            onChange={(e) => onChange1(Number(e.target.value))}
            className="w-full min-w-0"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-neutral-500 w-16 shrink-0 uppercase tracking-wide">
            Opacité
          </span>
          <input
            type="range"
            min={min2}
            max={max2}
            value={value2}
            onChange={(e) => onChange2(Number(e.target.value))}
            className="w-full min-w-0"
          />
        </div>
      </div>
    </div>
  );
}
