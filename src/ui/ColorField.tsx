interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export default function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-neutral-300">{label}</span>
      <label className="flex items-center gap-2 cursor-pointer bg-neutral-900 border border-neutral-700 hover:border-neutral-500 px-2.5 py-1.5 transition-colors shrink-0">
        <span
          className="w-4 h-4 rounded-full border border-neutral-600 shadow-inner"
          style={{ backgroundColor: value }}
        ></span>
        <span className="text-[11px] font-mono text-neutral-300">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
      </label>
    </div>
  );
}
