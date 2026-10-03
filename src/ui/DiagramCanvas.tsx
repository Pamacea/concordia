import type { RefObject } from 'react';
import { useCanvasHandlers } from '../features/canvas/useCanvasHandlers';
import {
  STRING_GAP,
  TITLE_FIRST_CY,
  diagramLayout,
  dotScale,
  freeTextMetrics,
} from '../lib/geometry';
import { diagramFingering } from '../lib/fingering';
import { bottomLabel } from '../lib/labels';
import { useChordsStore } from '../lib/store/chordsStore';
import { getIntervalInfo } from '../lib/theory';
import type { Diagram } from '../lib/types';

interface DiagramCanvasProps {
  svgRef: RefObject<SVGSVGElement | null>;
  diagram: Diagram;
}

export default function DiagramCanvas({ svgRef, diagram }: DiagramCanvasProps) {
  const style = useChordsStore((s) => s.style);
  const selectedTextId = useChordsStore((s) => s.selectedTextId);
  const { handleCanvasClick, handleCanvasContextMenu, handleCanvasPointerDown } =
    useCanvasHandlers(svgRef);

  const startFret = diagram.startFret || 1;
  const layout = diagramLayout(diagram, style);
  const {
    frets,
    gap,
    horizontal,
    offsetX,
    offsetY,
    nutZone,
    titleSize,
    titleLead,
    titleLines,
    width: canvasW,
    height: canvasH,
    bottomOffset,
  } = layout;
  const scale = dotScale(gap);
  const dotR = 22 * scale;

  /** Coordonnées logiques (repère vertical) → écran. */
  const X = (lx: number, ly: number) => (horizontal ? ly : lx);
  const Y = (lx: number, ly: number) => (horizontal ? lx : ly);

  return (
    <svg
      ref={svgRef}
      width={canvasW}
      height={canvasH}
      viewBox={`0 0 ${canvasW} ${canvasH}`}
      className="select-none transition-colors duration-200 cursor-pointer max-w-full h-auto"
      style={{ backgroundColor: style.diagramBgColor }}
      onClick={handleCanvasClick}
      onPointerDown={handleCanvasPointerDown}
      onContextMenu={handleCanvasContextMenu}
    >
      <rect width="100%" height="100%" fill={style.diagramBgColor} />

      {/* Titre multi-lignes : le canvas s'allonge pour le contenir */}
      {titleLines.map((line, i) => (
        <text
          key={`title-${i}`}
          x={canvasW / 2}
          y={TITLE_FIRST_CY + i * titleLead}
          fill="#ffffff"
          fontSize={titleSize}
          fontWeight="bold"
          fontFamily="sans-serif"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {line}
        </text>
      ))}

      {/* Indicateurs sillet (ouvert, muet, ou racine à vide) */}
      {Array.from({ length: 6 }).map((_, i) => {
        const status = diagramFingering(diagram, i);
        const hasFretted =
          (diagram.root !== null && diagram.root.s === i && diagram.root.f >= 0) ||
          diagram.notes.some((n) => n.s === i && n.f >= 0);
        const isOpenRoot =
          diagram.root !== null && diagram.root.s === i && diagram.root.f === -1;
        const cx = X(offsetX + i * STRING_GAP, nutZone);
        const cy = Y(offsetX + i * STRING_GAP, nutZone);

        if (isOpenRoot) {
          return (
            <g key={`nut-ind-${i}`}>
              <circle cx={cx} cy={cy} r={16} fill="#ef4444" />
              <text
                x={cx}
                y={cy}
                fill="#ffffff"
                fontSize="14"
                fontWeight="bold"
                fontFamily="sans-serif"
                textAnchor="middle"
                dominantBaseline="central"
              >
                R
              </text>
            </g>
          );
        }

        if (hasFretted) return null;
        // Cordes sans indication (doigté vide) → croix × par défaut ; chiffré (1-4) → rien.
        if (status !== '' && status !== '0' && status !== 'X') return null;

        return (
          <text
            key={`nut-ind-${i}`}
            x={cx}
            y={cy}
            fill={status === '0' ? '#cfa86a' : '#ef4444'}
            fontSize="24"
            fontWeight="bold"
            fontFamily="sans-serif"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {status === '0' ? '○' : '×'}
          </text>
        );
      })}

      {/* Cordes */}
      {Array.from({ length: 6 }).map((_, i) => {
        const proportionalWidth = Math.max(1, style.stringThicknessBase * (1 - i * 0.12));
        return (
          <line
            key={`string-${i}`}
            x1={X(offsetX + i * STRING_GAP, offsetY)}
            y1={Y(offsetX + i * STRING_GAP, offsetY)}
            x2={X(offsetX + i * STRING_GAP, offsetY + frets * gap)}
            y2={Y(offsetX + i * STRING_GAP, offsetY + frets * gap)}
            stroke="#ffffff"
            strokeWidth={proportionalWidth}
            opacity={style.stringOpacity / 100}
          />
        );
      })}

      {/* Frettes */}
      {Array.from({ length: frets + 1 }).map((_, i) => (
        <line
          key={`fret-${i}`}
          x1={X(offsetX, offsetY + i * gap)}
          y1={Y(offsetX, offsetY + i * gap)}
          x2={X(offsetX + 5 * STRING_GAP, offsetY + i * gap)}
          y2={Y(offsetX + 5 * STRING_GAP, offsetY + i * gap)}
          stroke="#ffffff"
          strokeWidth={style.fretThickness}
          opacity={style.fretOpacity / 100}
        />
      ))}

      {/* Sillet */}
      <line
        x1={X(offsetX - style.stringThicknessBase / 2, offsetY)}
        y1={Y(offsetX - style.stringThicknessBase / 2, offsetY)}
        x2={X(offsetX + 5 * STRING_GAP + style.stringThicknessBase / 2, offsetY)}
        y2={Y(offsetX + 5 * STRING_GAP + style.stringThicknessBase / 2, offsetY)}
        stroke={style.nutColor}
        strokeWidth={
          startFret === 1 ? style.nutThickness : Math.max(2, style.nutThickness * 0.4)
        }
        opacity={style.nutOpacity / 100}
      />

      {/* Numéros de cases (bas du canvas en mode horizontal, pour ne pas gêner le titre) */}
      {style.showFretNumbers && (
        <g>
          {Array.from({ length: frets }).map((_, i) => (
            <text
              key={`fret-num-${i}`}
              x={horizontal ? offsetY + i * gap + gap / 2 : offsetX - 28}
              y={horizontal ? canvasH - 37 : offsetY + i * gap + gap / 2}
              fill={style.fretNumberColor}
              fontSize={style.fretNumberSize}
              fontWeight="bold"
              fontFamily="sans-serif"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {startFret + i}
            </text>
          ))}
        </g>
      )}

      {/* Racine frettée */}
      {diagram.root !== null && diagram.root.f >= 0 && (
        <g>
          <circle
            cx={X(
              offsetX + diagram.root.s * STRING_GAP,
              offsetY + diagram.root.f * gap + gap / 2,
            )}
            cy={Y(
              offsetX + diagram.root.s * STRING_GAP,
              offsetY + diagram.root.f * gap + gap / 2,
            )}
            r={dotR}
            fill="#ef4444"
          />
          <text
            x={X(
              offsetX + diagram.root.s * STRING_GAP,
              offsetY + diagram.root.f * gap + gap / 2,
            )}
            y={Y(
              offsetX + diagram.root.s * STRING_GAP,
              offsetY + diagram.root.f * gap + gap / 2,
            )}
            fill="#ffffff"
            fontSize={18 * scale}
            fontWeight="bold"
            fontFamily="sans-serif"
            textAnchor="middle"
            dominantBaseline="central"
          >
            R
          </text>
        </g>
      )}

      {/* Autres notes frettées */}
      {diagram.notes.map((note) => {
        const info = getIntervalInfo(diagram.root, note, startFret);
        const lx = offsetX + note.s * STRING_GAP;
        const ly = offsetY + note.f * gap + gap / 2;
        const cx = X(lx, ly);
        const cy = Y(lx, ly);

        return (
          <g key={note.id}>
            <circle cx={cx} cy={cy} r={dotR} fill={info.color} />
            <text
              x={cx}
              y={cy}
              fill={info.text}
              fontSize={15 * scale}
              fontWeight="bold"
              fontFamily="sans-serif"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {info.label}
            </text>
          </g>
        );
      })}

      {/* Textes libres */}
      {diagram.texts.map((txtItem) => {
        const m = freeTextMetrics(txtItem, canvasW, horizontal);
        const sx = X(txtItem.x, txtItem.y);
        const sy = Y(txtItem.x, txtItem.y);
        const isSelected = selectedTextId === txtItem.id;
        return (
          <g key={txtItem.id}>
            {isSelected && (
              <rect
                x={sx - m.width / 2 - 6}
                y={sy - m.height / 2 - 4}
                width={m.width + 12}
                height={m.height + 8}
                fill="none"
                stroke="#cfa86a"
                strokeWidth={1.5}
                strokeDasharray="6 4"
              />
            )}
            <text
              x={sx}
              y={sy}
              fill={m.color}
              fontSize={m.size}
              fontWeight={m.bold ? 'bold' : 'normal'}
              fontFamily={m.fontFamily}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {txtItem.text}
            </text>
          </g>
        );
      })}

      {/* Indicateurs sous la table */}
      {layout.hasBottom &&
        Array.from({ length: 6 }).map((_, sIdx) => {
          const label = bottomLabel(diagram, style, sIdx, startFret);
          if (!label) return null;

          return (
            <text
              key={`bottom-ind-${sIdx}`}
              x={horizontal ? bottomOffset : offsetX + sIdx * STRING_GAP}
              y={horizontal ? offsetX + sIdx * STRING_GAP : bottomOffset}
              fill="#cfa86a"
              fontSize="18"
              fontWeight="bold"
              fontFamily="sans-serif"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {label}
            </text>
          );
        })}
    </svg>
  );
}
