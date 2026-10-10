import { Edit2, Minus, Plus } from 'lucide-react';
import { diagramFingering } from '../../../lib/fingering';
import { useChordsStore } from '../../../lib/store/chordsStore';
import { getNoteName, tuningOffsets } from '../../../lib/theory';
import type { Diagram, TuningId } from '../../../lib/types';

interface FingeringSectionProps {
  diagram: Diagram | null;
  /** Accordage validé (repli Standard E) — sert au paragraphe d'aide. */
  tuningValue: TuningId;
  setFingering: (stringIdx: number, value: string) => void;
}

export default function FingeringSection({
  diagram,
  tuningValue,
  setFingering,
}: FingeringSectionProps) {
  const transposeActive = useChordsStore((s) => s.transposeActive);

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
        <Edit2 size={14} /> Doigtés & Cordes à Vide
      </h3>

      {/* Transposition d'un demi-ton (fondamentale + notes du diagramme actif) */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
          Transposer
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => transposeActive(-1)}
            disabled={!diagram}
            title="Transposer d'un demi-ton vers le bas"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-gold text-gold text-xs font-bold transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <Minus size={12} />1
          </button>
          <button
            type="button"
            onClick={() => transposeActive(1)}
            disabled={!diagram}
            title="Transposer d'un demi-ton vers le haut"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-gold text-gold text-xs font-bold transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <Plus size={12} />1
          </button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: 6 }).map((_, idx) => {
          const num = String(6 - idx);
          const note = getNoteName(idx, 0, tuningOffsets(diagram?.tuning));
          return (
            <div key={idx} className="flex flex-col items-center gap-1">
              <span className="text-xs text-neutral-400 font-mono" title={`Corde ${num} (${note})`}>
                {num}·{note}
              </span>
              <input
                type="text"
                maxLength={2}
                value={diagram ? diagramFingering(diagram, idx) : ''}
                disabled={!diagram}
                onChange={(e) => setFingering(idx, e.target.value)}
                className="w-full text-center bg-neutral-900 border border-neutral-800 px-1.5 py-2 text-sm font-semibold text-gold focus:outline-none focus:border-gold disabled:opacity-50"
                placeholder="-"
              />
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-neutral-500 italic">
        {`6 = ${getNoteName(0, 0, tuningOffsets(tuningValue))} grave → 1 = ${getNoteName(
          5,
          0,
          tuningOffsets(tuningValue),
        )} aigu · 0 = Corde à vide (○), X = Non jouée (×)`}
      </p>
    </div>
  );
}
