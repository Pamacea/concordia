import { Bold, GripVertical, Trash2, X } from 'lucide-react';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { diagramLayout, freeTextMetrics } from '../lib/geometry';
import { useChordsStore } from '../lib/store/chordsStore';
import ColorField from './ColorField';

/**
 * Polices système uniquement : l'export PNG/PDF passe par un blob SVG
 * qui ne charge pas les polices web (Google Fonts) à l'exécution.
 */
const FONT_CHOICES = [
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times', value: "'Times New Roman', Times, serif" },
  { label: 'Courier', value: "'Courier New', monospace" },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet', value: "'Trebuchet MS', sans-serif" },
  { label: 'Impact', value: 'Impact' },
] as const;

const PANEL_WIDTH = 256;
const EDGE_GAP = 8;
const MIN_SIZE = 10;
const MAX_SIZE = 120;

interface TextToolPanelProps {
  svgRef: RefObject<SVGSVGElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
}

/** Panneau flottant de l'outul texte : contenu, police, taille, couleur, gras. */
export default function TextToolPanel({ svgRef, containerRef }: TextToolPanelProps) {
  const activeDiagramId = useChordsStore((s) => s.activeDiagramId);
  const diagrams = useChordsStore((s) => s.diagrams);
  const style = useChordsStore((s) => s.style);
  const selectedTextId = useChordsStore((s) => s.selectedTextId);
  const selectText = useChordsStore((s) => s.selectText);
  const updateText = useChordsStore((s) => s.updateText);
  const deleteText = useChordsStore((s) => s.deleteText);

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
    const maxY = container.scrollTop + c.height - (panelRef.current?.offsetHeight ?? 300) - EDGE_GAP;
    setPos({
      x: Math.max(EDGE_GAP + container.scrollLeft, Math.min(s.right - c.left + 12 + container.scrollLeft, maxX)),
      y: Math.max(EDGE_GAP + container.scrollTop, Math.min(s.top - c.top + container.scrollTop, maxY)),
    });
  }, [text, pos, containerRef, svgRef]);

  /** Focus automatique pour saisir le contenu dès l'apparition du panneau. */
  const shown = !!(text && pos);
  useEffect(() => {
    if (shown) textareaRef.current?.focus();
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

  if (!text || !diagram || !pos) return null;

  const layout = diagramLayout(diagram, style);
  const metrics = freeTextMetrics(text, layout.width, layout.horizontal);
  const size = text.fontSize ?? metrics.size;

  return (
    <div
      ref={panelRef}
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

        <div className="space-y-1.5">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Police
          </span>
          <select
            value={text.fontFamily ?? FONT_CHOICES[0].value}
            onChange={(e) => updateText(text.id, { fontFamily: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-800 px-2 py-1.5 text-sm text-neutral-200 focus:outline-none focus:border-gold"
          >
            {FONT_CHOICES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1.5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Taille (px)
            </span>
            <input
              type="number"
              min={MIN_SIZE}
              max={MAX_SIZE}
              value={size}
              onChange={(e) => {
                // Pas de clamp bas pendant la frappe : « 40 » deviendrait « 10 »+« 0 » → 100.
                const v = parseInt(e.target.value, 10);
                if (!Number.isNaN(v)) {
                  updateText(text.id, { fontSize: Math.min(MAX_SIZE, v) });
                }
              }}
              onBlur={(e) => {
                const v = parseInt(e.target.value, 10);
                const clamped = Number.isNaN(v)
                  ? MIN_SIZE
                  : Math.max(MIN_SIZE, Math.min(MAX_SIZE, v));
                if (clamped !== v) updateText(text.id, { fontSize: clamped });
              }}
              className="w-full bg-neutral-900 border border-neutral-800 px-2 py-1.5 text-sm text-neutral-200 focus:outline-none focus:border-gold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <button
            type="button"
            onClick={() => updateText(text.id, { bold: !(text.bold !== false) })}
            title="Gras"
            className={`shrink-0 p-2 border transition-colors ${
              text.bold !== false
                ? 'bg-gold border-gold text-neutral-950'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600'
            }`}
          >
            <Bold size={14} />
          </button>
        </div>

        <ColorField
          label="Couleur"
          value={text.color ?? '#ffffff'}
          onChange={(v) => updateText(text.id, { color: v })}
        />

        <button
          type="button"
          onClick={() => deleteText(text.id)}
          className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-semibold text-red-400 hover:text-white hover:bg-red-600 border border-red-900 hover:border-red-600 transition-colors"
        >
          <Trash2 size={13} />
          Supprimer
        </button>
      </div>
    </div>
  );
}
