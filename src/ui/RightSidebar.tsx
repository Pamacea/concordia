import { ChevronRight } from 'lucide-react';
import { MAX_FRETS, MAX_FRET, MIN_FRETS } from '../lib/geometry';
import { useChordsStore } from '../lib/store/chordsStore';
import type {
  BottomIndicatorType,
  DiagramOrientation,
  NutIndicatorType,
  TuningId,
} from '../lib/types';
import { isTuningId } from './right/guards';
import BottomIndicatorSection from './right/sections/BottomIndicatorSection';
import FingeringSection from './right/sections/FingeringSection';
import FretNumberSection from './right/sections/FretNumberSection';
import FretSection from './right/sections/FretSection';
import NutIndicatorSection from './right/sections/NutIndicatorSection';
import OrientationSection from './right/sections/OrientationSection';
import StyleSection from './right/sections/StyleSection';
import TuningSection from './right/sections/TuningSection';

export default function RightSidebar() {
  const style = useChordsStore((s) => s.style);
  const updateStyle = useChordsStore((s) => s.updateStyle);
  const activeDiagramId = useChordsStore((s) => s.activeDiagramId);
  const diagrams = useChordsStore((s) => s.diagrams);
  const updateActiveDiagram = useChordsStore((s) => s.updateActiveDiagram);
  const setSidebar = useChordsStore((s) => s.setSidebar);

  const diagram = activeDiagramId ? (diagrams[activeDiagramId] ?? null) : null;
  // Repli sur Standard E si l'accordage persisté n'est plus connu.
  const tuningValue: TuningId =
    diagram?.tuning !== undefined && isTuningId(diagram.tuning) ? diagram.tuning : 'standard-e';

  const setStartFret = (fret: number) => {
    const clamped = Math.max(1, Math.min(MAX_FRET, fret));
    updateActiveDiagram((d) => ({ ...d, startFret: clamped }));
  };

  const setFretCount = (count: number) => {
    const clamped = Math.max(MIN_FRETS, Math.min(MAX_FRETS, count));
    updateActiveDiagram((d) => ({ ...d, fretCount: clamped }));
  };

  const setOrientation = (orientation: DiagramOrientation) => {
    updateActiveDiagram((d) => ({ ...d, orientation }));
  };

  const setTuning = (tuning: TuningId) => {
    updateActiveDiagram((d) => ({ ...d, tuning }));
  };

  const setNutIndicator = (nutIndicator: NutIndicatorType) => {
    updateActiveDiagram((d) => ({ ...d, nutIndicator }));
  };

  const setFingering = (stringIdx: number, value: string) => {
    updateActiveDiagram((d) => ({
      ...d,
      fingerings: { ...d.fingerings, [stringIdx]: value },
    }));
  };

  const setBottomIndicator = (bottomIndicatorType: BottomIndicatorType) => {
    updateStyle({ bottomIndicatorType });
  };

  return (
    <div className="w-80 md:w-72 lg:w-80 bg-neutral-950 border-l border-neutral-800 flex flex-col shrink-0 z-40 md:z-10 absolute md:relative inset-y-0 right-0 shadow-2xl md:shadow-none overflow-clip">
      <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
        <span className="text-xs font-bold text-white uppercase tracking-wider">Propriétés</span>
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
          <FretSection
            diagram={diagram}
            style={style}
            setStartFret={setStartFret}
            setFretCount={setFretCount}
          />

          {/* Orientation */}
          <OrientationSection diagram={diagram} setOrientation={setOrientation} />

          {/* Doigtés & cordes à vide */}
          <FingeringSection
            diagram={diagram}
            tuningValue={tuningValue}
            setFingering={setFingering}
          />

          <div className="w-full h-px bg-neutral-800" />

          {/* Accordage — propre à chaque diagramme */}
          <TuningSection diagram={diagram} tuningValue={tuningValue} setTuning={setTuning} />

          {/* Indicateurs dessus le sillet — propres à chaque diagramme */}
          <NutIndicatorSection diagram={diagram} setNutIndicator={setNutIndicator} />

          {/* Indicateurs sous la table */}
          <BottomIndicatorSection value={style.bottomIndicatorType} onChange={setBottomIndicator} />

          <div className="w-full h-px bg-neutral-800" />

          {/* Style du diagramme */}
          <StyleSection style={style} updateStyle={updateStyle} />

          <div className="w-full h-px bg-neutral-800" />

          {/* Numéros de cases */}
          <FretNumberSection style={style} updateStyle={updateStyle} />
        </div>
      </div>
    </div>
  );
}
