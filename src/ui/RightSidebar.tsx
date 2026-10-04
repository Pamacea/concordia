import { ChevronRight, Edit2, Palette } from 'lucide-react';
import { diagramFingering } from '../lib/fingering';
import { MAX_FRETS, MAX_FRET, MIN_FRETS, totalFretsFor } from '../lib/geometry';
import { useChordsStore } from '../lib/store/chordsStore';
import type { BottomIndicatorType, DiagramOrientation } from '../lib/types';
import ColorField from './ColorField';

const BOTTOM_INDICATOR_VALUES: readonly BottomIndicatorType[] = [
  'notes',
  'fingerings',
  'intervals',
  'none',
];

function isBottomIndicatorType(value: string): value is BottomIndicatorType {
  return BOTTOM_INDICATOR_VALUES.some((v) => v === value);
}

function toBottomIndicatorType(value: string): BottomIndicatorType {
  return isBottomIndicatorType(value) ? value : 'none';
}

interface StepperInputProps {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

function StepperInput({ value, min, max, onChange }: StepperInputProps) {
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

function SliderPair({
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
      <span className="block text-xs font-bold text-white uppercase tracking-wider">
        {label}
      </span>
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

export default function RightSidebar() {
  const style = useChordsStore((s) => s.style);
  const updateStyle = useChordsStore((s) => s.updateStyle);
  const activeDiagramId = useChordsStore((s) => s.activeDiagramId);
  const diagrams = useChordsStore((s) => s.diagrams);
  const updateActiveDiagram = useChordsStore((s) => s.updateActiveDiagram);
  const setSidebar = useChordsStore((s) => s.setSidebar);

  const diagram = activeDiagramId ? (diagrams[activeDiagramId] ?? null) : null;
  const orientation: DiagramOrientation = diagram?.orientation ?? 'vertical';

  const setStartFret = (fret: number) => {
    const clamped = Math.max(1, Math.min(MAX_FRET, fret));
    updateActiveDiagram((d) => ({ ...d, startFret: clamped }));
  };

  const setFretCount = (count: number) => {
    const clamped = Math.max(MIN_FRETS, Math.min(MAX_FRETS, count));
    updateActiveDiagram((d) => ({ ...d, fretCount: clamped }));
  };

  const setOrientation = (o: DiagramOrientation) => {
    updateActiveDiagram((d) => ({ ...d, orientation: o }));
  };

  return (
    <div className="w-80 md:w-72 lg:w-80 bg-neutral-950 border-l border-neutral-800 flex flex-col shrink-0 z-40 md:z-10 absolute md:relative inset-y-0 right-0 shadow-2xl md:shadow-none overflow-clip">
      <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          Propriétés
        </span>
        <button
          onClick={() => setSidebar('right', false)}
          title="Fermer le panneau droit"
          className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors border border-neutral-700 shadow-sm flex items-center justify-center shrink-0"
        >
          <ChevronRight size={16} className="text-gold" />
        </button>
      </div>

      {/* dir="rtl" fait glisser la scrollbar sur le bord gauche du panneau ; le contenu reste LTR */}
      <div className="flex-1 overflow-y-auto" dir="rtl">
        <div dir="ltr" className="p-3 space-y-4">
        {/* Case de départ & nombre de frettes */}
        {diagram && (
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
                value={diagram.fretCount ?? totalFretsFor(style.bottomIndicatorType)}
                min={MIN_FRETS}
                max={MAX_FRETS}
                onChange={setFretCount}
              />
              <span className="block text-[10px] text-neutral-500 font-medium">
                Affichées · {MIN_FRETS}–{MAX_FRETS}
              </span>
            </div>
          </div>
        )}

        {/* Orientation */}
        {diagram && (
          <div className="space-y-1.5 bg-neutral-900/60 p-2.5 border border-neutral-800">
            <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">
              Orientation
            </h3>
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
        )}

        {/* Doigtés & cordes à vide */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Edit2 size={14} /> Doigtés & Cordes à Vide
          </h3>
          <div className="grid grid-cols-6 gap-1.5">
            {[
              { num: '6', note: 'E' },
              { num: '5', note: 'A' },
              { num: '4', note: 'D' },
              { num: '3', note: 'G' },
              { num: '2', note: 'B' },
              { num: '1', note: 'e' },
            ].map(({ num, note }, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span
                  className="text-xs text-neutral-400 font-mono"
                  title={`Corde ${num} (${note})`}
                >
                  {num}·{note}
                </span>
                <input
                  type="text"
                  maxLength={2}
                  value={diagram ? diagramFingering(diagram, idx) : ''}
                  disabled={!diagram}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateActiveDiagram((d) => ({
                      ...d,
                      fingerings: { ...d.fingerings, [idx]: val },
                    }));
                  }}
                  className="w-full text-center bg-neutral-900 border border-neutral-800 px-1.5 py-2 text-sm font-semibold text-gold focus:outline-none focus:border-gold disabled:opacity-50"
                  placeholder="-"
                />
              </div>
            ))}
          </div>
          <p className="text-[11px] text-neutral-500 italic">
            6 = Mi grave → 1 = Mi aigu · 0 = Corde à vide (○), X = Non jouée (×)
          </p>
        </div>

        <div className="w-full h-px bg-neutral-800"></div>

        {/* Indicateurs sous la table */}
        <div className="space-y-2 bg-neutral-900/60 p-2.5 border border-neutral-800">
          <h3 className="text-xs font-bold text-gold uppercase tracking-wider">
            Indicateurs sous la touche
          </h3>
          <select
            value={style.bottomIndicatorType}
            onChange={(e) =>
              updateStyle({
                bottomIndicatorType: toBottomIndicatorType(e.target.value),
              })
            }
            className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-gold font-medium"
          >
            <option value="notes">Note</option>
            <option value="fingerings">Doigtés Personnalisés</option>
            <option value="intervals">Intervals / Degrés</option>
            <option value="none">Aucun</option>
          </select>
        </div>

        <div className="w-full h-px bg-neutral-800"></div>

        {/* Style du diagramme */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Palette size={14} /> Style du Diagramme
          </h3>

          <ColorField
            label="Couleur de fond"
            value={style.diagramBgColor}
            onChange={(v) => updateStyle({ diagramBgColor: v })}
          />
          <ColorField
            label="Couleur du sillet"
            value={style.nutColor}
            onChange={(v) => updateStyle({ nutColor: v })}
          />

          <SliderPair
            label="Sillet de tête (Épaisseur & Opacité)"
            min1={2}
            max1={16}
            value1={style.nutThickness}
            onChange1={(v) => updateStyle({ nutThickness: v })}
            min2={10}
            max2={100}
            value2={style.nutOpacity}
            onChange2={(v) => updateStyle({ nutOpacity: v })}
          />

          <SliderPair
            label="Cordes (Épaisseur & Opacité)"
            min1={1}
            max1={8}
            value1={style.stringThicknessBase}
            onChange1={(v) => updateStyle({ stringThicknessBase: v })}
            min2={10}
            max2={100}
            value2={style.stringOpacity}
            onChange2={(v) => updateStyle({ stringOpacity: v })}
          />

          <SliderPair
            label="Frettes (Épaisseur & Opacité)"
            min1={1}
            max1={8}
            value1={style.fretThickness}
            onChange1={(v) => updateStyle({ fretThickness: v })}
            min2={10}
            max2={100}
            value2={style.fretOpacity}
            onChange2={(v) => updateStyle({ fretOpacity: v })}
          />
        </div>

        <div className="w-full h-px bg-neutral-800"></div>

        {/* Numéros de cases */}
        <div className="space-y-2.5 bg-neutral-900/60 p-2.5 border border-neutral-800">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Numéros de cases
            </span>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={style.showFretNumbers}
                onChange={(e) => updateStyle({ showFretNumbers: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-[22px] bg-neutral-800 border border-neutral-600 peer-checked:bg-gold peer-checked:border-gold-light relative transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:h-[14px] after:w-4 after:bg-neutral-400 after:transition-all after:duration-200 peer-checked:after:translate-x-[18px] peer-checked:after:bg-white"></div>
            </label>
          </div>

          {style.showFretNumbers && (
            <div className="space-y-2.5 pt-1">
              <ColorField
                label="Couleur du texte"
                value={style.fretNumberColor}
                onChange={(v) => updateStyle({ fretNumberColor: v })}
              />
              <div className="space-y-1.5 px-1.5">
                <span className="text-xs text-neutral-300">
                  Taille de police ({style.fretNumberSize}px)
                </span>
                <input
                  type="range"
                  min="12"
                  max="28"
                  value={style.fretNumberSize}
                  onChange={(e) => updateStyle({ fretNumberSize: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
