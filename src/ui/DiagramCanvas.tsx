import { useMemo, type ReactNode, type RefObject } from 'react';
import { useCanvasHandlers } from '../features/canvas/useCanvasHandlers';
import { diagramLayout, freeTextMetrics } from '../lib/geometry';
import { buildPrimitives, project } from '../lib/render/buildPrimitives';
import { C_GOLD } from '../lib/render/tokens';
import type { Primitive } from '../lib/render/types';
import { useChordsStore } from '../lib/store/chordsStore';
import type { Diagram } from '../lib/types';

interface DiagramCanvasProps {
  svgRef: RefObject<SVGSVGElement | null>;
  diagram: Diagram;
}

/** Primitive → élément JSX : structure strictement identique à l'export SVG. */
const primToJSX = (p: Primitive): ReactNode => {
  switch (p.kind) {
    case 'line':
      return (
        <line
          key={p.key}
          x1={p.x1}
          y1={p.y1}
          x2={p.x2}
          y2={p.y2}
          stroke={p.stroke}
          strokeWidth={p.strokeWidth}
          opacity={p.opacity}
          strokeDasharray={p.strokeDasharray}
        />
      );
    case 'text':
      return (
        <text
          key={p.key}
          x={p.x}
          y={p.y}
          fill={p.fill}
          fontSize={p.fontSize}
          fontWeight={p.fontWeight}
          fontFamily={p.fontFamily}
          textAnchor={p.textAnchor}
          dominantBaseline={p.dominantBaseline}
        >
          {p.text}
        </text>
      );
    case 'circle':
      return (
        <circle
          key={p.key}
          cx={p.cx}
          cy={p.cy}
          r={p.r}
          fill={p.fill}
          stroke={p.stroke}
          strokeWidth={p.strokeWidth}
        />
      );
    case 'rect':
      return (
        <rect
          key={p.key}
          x={p.x}
          y={p.y}
          width={p.width}
          height={p.height}
          fill={p.fill}
          stroke={p.stroke}
          strokeWidth={p.strokeWidth}
          rx={p.rx}
        />
      );
    case 'group':
      return <g key={p.key}>{p.children.map(primToJSX)}</g>;
  }
};

export default function DiagramCanvas({ svgRef, diagram }: DiagramCanvasProps) {
  const style = useChordsStore((s) => s.style);
  const selectedTextId = useChordsStore((s) => s.selectedTextId);
  const { handleCanvasClick, handleCanvasContextMenu, handleCanvasPointerDown } =
    useCanvasHandlers(svgRef);

  const layout = diagramLayout(diagram, style);
  const primitives = useMemo(() => buildPrimitives(diagram, style), [diagram, style]);

  // Overlay de sélection : interaction écran UNIQUEMENT. Il n'est jamais
  // construit par buildPrimitives, donc jamais présent dans l'export SVG.
  const selected = selectedTextId ? diagram.texts.find((t) => t.id === selectedTextId) : undefined;
  let selectionBox: ReactNode = null;
  if (selected) {
    const { X, Y } = project(layout.horizontal);
    const m = freeTextMetrics(selected, layout.width, layout.horizontal);
    const sx = X(selected.x, selected.y);
    const sy = Y(selected.x, selected.y);
    selectionBox = (
      <rect
        x={sx - m.width / 2 - 6}
        y={sy - m.height / 2 - 4}
        width={m.width + 12}
        height={m.height + 8}
        fill="none"
        stroke={C_GOLD}
        strokeWidth={1.5}
        strokeDasharray="6 4"
      />
    );
  }

  return (
    <svg
      ref={svgRef}
      width={layout.width}
      height={layout.height}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className="select-none transition-colors duration-200 cursor-pointer h-auto"
      style={{ backgroundColor: style.diagramBgColor, maxWidth: '100%' }}
      onClick={handleCanvasClick}
      onPointerDown={handleCanvasPointerDown}
      onContextMenu={handleCanvasContextMenu}
    >
      <rect width="100%" height="100%" fill={style.diagramBgColor} />
      {primitives.map(primToJSX)}
      {selectionBox}
    </svg>
  );
}
