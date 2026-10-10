interface StepperInputProps {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

export default function StepperInput({ value, min, max, onChange }: StepperInputProps) {
  return (
    <div className="relative flex items-center bg-neutral-800 border border-neutral-700 overflow-hidden focus-within:border-gold transition-colors">
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || min)}
        className="w-full min-w-0 bg-transparent text-white text-sm px-2 py-2 focus:outline-none font-bold text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <div className="flex flex-col border-l border-neutral-700 bg-neutral-900 shrink-0">
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="px-2 py-1 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors text-[10px] leading-none"
          title="Incrémenter"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          className="px-2 py-1 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors text-[10px] leading-none border-t border-neutral-800"
          title="Décrémenter"
        >
          ▼
        </button>
      </div>
    </div>
  );
}
