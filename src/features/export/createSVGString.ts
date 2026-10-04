import {
  FRET_NUM_GAP,
  TITLE_FIRST_CY,
  diagramLayout,
  dotScale,
  freeTextMetrics,
} from '../../lib/geometry';
import { diagramFingering } from '../../lib/fingering';
import { bottomLabel } from '../../lib/labels';
import { getIntervalInfo } from '../../lib/theory';
import type { Diagram, StyleSettings } from '../../lib/types';

/** Échappe les caractères XML des contenus utilisateur (textes, noms). */
const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/** Génère la représentation SVG autonome d'un diagramme (pour l'export). */
export const createSVGString = (diag: Diagram, style: StyleSettings): string => {
  const startFret = diag.startFret || 1;
  const layout = diagramLayout(diag, style);
  const {
    frets,
    gap,
    stringGap,
    horizontal,
    offsetX,
    offsetY,
    nutZone,
    titleSize,
    titleLead,
    titleLines,
    width: canvasW,
    height: canvasH,
    hasBottom,
    bottomOffset,
  } = layout;
  const scale = dotScale(gap);
  const dotR = 22 * scale;

  /** Coordonnées logiques (repère vertical) → écran. */
  const X = (lx: number, ly: number) => (horizontal ? ly : lx);
  const Y = (lx: number, ly: number) => (horizontal ? lx : ly);

  /** Position (axe logique X) d'une corde : inversée en horizontal (corde 6 grave en bas). */
  const stringX = (s: number) => offsetX + (horizontal ? 5 - s : s) * stringGap;

  const titleHTML = titleLines
    .map(
      (line, i) =>
        `<text x="${canvasW / 2}" y="${TITLE_FIRST_CY + i * titleLead}" fill="#ffffff" font-size="${titleSize}" font-weight="bold" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">${escapeXml(line)}</text>`,
    )
    .join('');

  let fretNumsHTML = '';
  if (style.showFretNumbers) {
    for (let i = 0; i < frets; i++) {
      const nx = horizontal ? offsetY + i * gap + gap / 2 : offsetX - FRET_NUM_GAP;
      const ny = horizontal ? canvasH - 37 : offsetY + i * gap + gap / 2;
      fretNumsHTML += `<text x="${nx}" y="${ny}" fill="${style.fretNumberColor}" font-size="${style.fretNumberSize}" font-weight="bold" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">${startFret + i}</text>`;
    }
  }

  let nutIndicatorsHTML = '';
  for (let i = 0; i < 6; i++) {
    const status = diagramFingering(diag, i);
    const hasFretted =
      (diag.root !== null && diag.root.s === i && diag.root.f >= 0) ||
      diag.notes.some((n) => n.s === i && n.f >= 0);
    const isOpenRoot = diag.root !== null && diag.root.s === i && diag.root.f === -1;
    const ix = X(stringX(i), nutZone);
    const iy = Y(stringX(i), nutZone);

    if (isOpenRoot) {
      nutIndicatorsHTML += `<circle cx="${ix}" cy="${iy}" r="16" fill="#ef4444"/><text x="${ix}" y="${iy}" fill="#ffffff" font-size="14" font-weight="bold" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">R</text>`;
    } else if (!hasFretted && (status === '' || status === '0' || status === 'X')) {
      nutIndicatorsHTML += `<text x="${ix}" y="${iy}" fill="${status === '0' ? '#cfa86a' : '#ef4444'}" font-size="24" font-weight="bold" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">${status === '0' ? '○' : '×'}</text>`;
    }
  }

  let rootHTML = '';
  if (diag.root !== null && diag.root.f >= 0 && diag.root.f < frets) {
    const rx = X(
      stringX(diag.root.s),
      offsetY + diag.root.f * gap + gap / 2,
    );
    const ry = Y(
      stringX(diag.root.s),
      offsetY + diag.root.f * gap + gap / 2,
    );
    rootHTML = `<circle cx="${rx}" cy="${ry}" r="${dotR}" fill="#ef4444"/><text x="${rx}" y="${ry}" fill="#ffffff" font-size="${18 * scale}" font-weight="bold" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">R</text>`;
  }

  const notesHTML = diag.notes
    .filter((note) => note.f < frets)
    .map((note) => {
      const info = getIntervalInfo(diag.root, note, startFret);
      const nx = X(stringX(note.s), offsetY + note.f * gap + gap / 2);
      const ny = Y(stringX(note.s), offsetY + note.f * gap + gap / 2);
      return `<circle cx="${nx}" cy="${ny}" r="${dotR}" fill="${info.color}"/><text x="${nx}" y="${ny}" fill="${info.text}" font-size="${15 * scale}" font-weight="bold" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">${info.label}</text>`;
    })
    .join('');

  const textsHTML = diag.texts
    .map((t) => {
      const m = freeTextMetrics(t, canvasW, horizontal);
      const sx = X(t.x, t.y);
      const sy = Y(t.x, t.y);
      return `<text x="${sx}" y="${sy}" fill="${escapeXml(m.color)}" font-size="${m.size}" font-weight="${m.bold ? 'bold' : 'normal'}" font-family="${escapeXml(m.fontFamily)}" text-anchor="middle" dominant-baseline="central">${escapeXml(t.text)}</text>`;
    })
    .join('');

  let bottomHTML = '';
  if (hasBottom) {
    for (let sIdx = 0; sIdx < 6; sIdx++) {
      const label = bottomLabel(diag, style, sIdx, startFret);
      if (label) {
        const bx = horizontal ? bottomOffset : stringX(sIdx);
        const by = horizontal ? stringX(sIdx) : bottomOffset;
        bottomHTML += `<text x="${bx}" y="${by}" fill="#cfa86a" font-size="18" font-weight="bold" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">${label}</text>`;
      }
    }
  }

  const nutWidthVal = startFret === 1 ? style.nutThickness : Math.max(2, style.nutThickness * 0.4);
  const nutHTML = `<line x1="${X(offsetX - style.stringThicknessBase / 2, offsetY)}" y1="${Y(offsetX - style.stringThicknessBase / 2, offsetY)}" x2="${X(offsetX + 5 * stringGap + style.stringThicknessBase / 2, offsetY)}" y2="${Y(offsetX + 5 * stringGap + style.stringThicknessBase / 2, offsetY)}" stroke="${style.nutColor}" stroke-width="${nutWidthVal}" opacity="${style.nutOpacity / 100}"/>`;

  const stringsHTML = Array.from({ length: 6 })
    .map((_, i) => {
      const pw = Math.max(1, style.stringThicknessBase * (1 - i * 0.12));
      const sx1 = X(stringX(i), offsetY);
      const sy1 = Y(stringX(i), offsetY);
      const sx2 = X(stringX(i), offsetY + frets * gap);
      const sy2 = Y(stringX(i), offsetY + frets * gap);
      return `<line x1="${sx1}" y1="${sy1}" x2="${sx2}" y2="${sy2}" stroke="#ffffff" stroke-width="${pw}" opacity="${style.stringOpacity / 100}"/>`;
    })
    .join('');

  const fretsHTML = Array.from({ length: frets + 1 })
    .map((_, i) => {
      const fx1 = X(offsetX, offsetY + i * gap);
      const fy1 = Y(offsetX, offsetY + i * gap);
      const fx2 = X(offsetX + 5 * stringGap, offsetY + i * gap);
      const fy2 = Y(offsetX + 5 * stringGap, offsetY + i * gap);
      return `<line x1="${fx1}" y1="${fy1}" x2="${fx2}" y2="${fy2}" stroke="#ffffff" stroke-width="${style.fretThickness}" opacity="${style.fretOpacity / 100}"/>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}">
      <rect width="100%" height="100%" fill="${style.diagramBgColor}"/>
      ${titleHTML}
      ${nutIndicatorsHTML}
      ${stringsHTML}
      ${fretsHTML}
      ${nutHTML}
      ${fretNumsHTML}
      ${rootHTML}
      ${notesHTML}
      ${textsHTML}
      ${bottomHTML}
    </svg>`;
};
