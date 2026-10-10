const PDF_GRID_OPTIONS = [1, 2, 4, 6, 8, 12] as const;

interface PdfOptionsProps {
  pdfGrid: number;
  onChange: (grid: number) => void;
}

/** Options spécifiques à l'export PDF : disposition par page A4. */
export default function PdfOptions({ pdfGrid, onChange }: PdfOptionsProps) {
  return (
    <div className="space-y-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
      <label className="text-xs font-bold text-gold uppercase tracking-wider">
        Disposition PDF (par page A4)
      </label>
      <select
        value={pdfGrid}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-200 focus:outline-none focus:border-gold font-medium"
      >
        {PDF_GRID_OPTIONS.map((n) => (
          <option key={n} value={n}>
            {n} diagramme{n > 1 ? 's' : ''} par page
            {n === 4
              ? ' (Grid 2x2)'
              : n === 6
                ? ' (Grid 2x3)'
                : n === 8
                  ? ' (Grid 2x4)'
                  : n === 12
                    ? ' (Grid 3x4)'
                    : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
