import { AnimatePresence, motion } from 'motion/react';
import { GripVertical, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { useChordsStore } from '../lib/store/chordsStore';
import TextActions from './text/TextActions';
import TextFontFields from './text/TextFontFields';

const PANEL_WIDTH = 256;
const EDGE_GAP = 8;

interface TextToolPanelProps {
  svgRef: RefObject<SVGSVGElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
}

/** Panneau flottant de l'outul texte : contenu, police, taille, couleur, gras. */
export default function TextToolPanel({ svgRef, containerRef }: TextToolPanelProps) {
  const activeDiagramId = useChordsStore((s) => s.activeDiagramId);
  const diagrams = useChordsStore((s) => s.diagrams);
  const selectedTextId = useChordsStore((s) => s.selectedTextId);
  const selectText = useChordsStore((s) => s.selectText);
  const updateText = useChordsStore((s) => s.updateText);

  const diagram = activeDiagramId ? (diagrams[activeDiagramId] ?? null) : null;
  const text = diagram?.texts.find((t) => t.id === selectedTextId) ?? null;

  const panelRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  /** Position initiale : à droite du diagramme, bornée dans le conteneur. */
  useLayoutEffect(() => {
    if (!text || pos) return;
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;
    const c = container.getBoundingClientRect();
    const s = svg.getBoundingClientRect();
    const maxX = container.scrollLeft + c.width - PANEL_WIDTH - EDGE_GAP;
    const maxY =
      container.scrollTop + c.height - (panelRef.current?.offsetHeight ?? 300) - EDGE_GAP;
    setPos({
      x: Math.max(
        EDGE_GAP + container.scrollLeft,
        Math.min(s.right - c.left + 12 + container.scrollLeft, maxX),
      ),
      y: Math.max(
        EDGE_GAP + container.scrollTop,
        Math.min(s.top - c.top + container.scrollTop, maxY),
      ),
    });
  }, [text, pos, containerRef, svgRef]);

  /** Focus automatique pour saisir le contenu dès l'apparition du panneau. */
  const shown = !!(text && pos);
  useEffect(() => {
    if (shown && text?.id) textareaRef.current?.focus();
  }, [shown, text?.id]);

  const startDrag = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const container = containerRef.current;
    const panel = panelRef.current;
    if (!container || !panel || !pos) return;

    const grabX = e.clientX - container.getBoundingClientRect().left + container.scrollLeft - pos.x;
    const grabY = e.clientY - container.getBoundingClientRect().top + container.scrollTop - pos.y;
    const panelH = panel.offsetHeight;

    const onMove = (ev: PointerEvent) => {
      const c = container.getBoundingClientRect();
      const x = ev.clientX - c.left + container.scrollLeft - grabX;
      const y = ev.clientY - c.top + container.scrollTop - grabY;
      setPos({
        x: Math.max(
          EDGE_GAP + container.scrollLeft,
          Math.min(x, container.scrollLeft + c.width - PANEL_WIDTH - EDGE_GAP),
        ),
        y: Math.max(
          EDGE_GAP + container.scrollTop,
          Math.min(y, container.scrollTop + c.height - panelH - EDGE_GAP),
        ),
      });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  if (!pos) return null;

  return (
    <AnimatePresence>
      {text && diagram && pos && (
        <motion.div
          key="text-tool-panel"
          ref={panelRef}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute z-40 w-64 bg-neutral-950 border border-neutral-700 shadow-2xl"
          style={{ left: pos.x, top: pos.y }}
        >
          {/* Barre de titre : déplace le panneau */}
          <div
            className="flex items-center justify-between gap-2 px-3 py-2 bg-neutral-900 border-b border-neutral-800 cursor-move"
            onPointerDown={startDrag}
          >
            <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-300">
              <GripVertical size={14} className="text-neutral-500" />
              Texte
            </span>
            <button
              type="button"
              onClick={() => selectText(null)}
              title="Fermer le panneau texte"
              className="p-1 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-3 space-y-3">
            <textarea
              ref={textareaRef}
              value={text.text}
              onChange={(e) => updateText(text.id, { text: e.target.value })}
              rows={3}
              placeholder="Votre texte…"
              className="w-full bg-neutral-900 border border-neutral-800 px-2 py-1.5 text-sm text-white resize-none focus:outline-none focus:border-gold"
            />

            <TextFontFields text={text} />

            <TextActions textId={text.id} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
