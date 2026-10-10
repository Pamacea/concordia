import type { FreeText } from '../types';
import { DEFAULT_TEXT_SIZE, MIN_TEXT_SIZE } from './constants';

/** Réduit la taille de police pour que le texte tienne dans `maxWidth`. */
export const fitFontSize = (text: string, maxWidth: number, maxSize = 32, minSize = 10): number => {
  const estimatedWidth = text.length * maxSize * 0.6;
  if (estimatedWidth <= maxWidth) return maxSize;
  return Math.max(minSize, Math.floor((maxWidth / estimatedWidth) * maxSize));
};

let measureCtx: CanvasRenderingContext2D | null | undefined;

/** Largeur réelle d'un texte (mesure navigateur, estimation en secours). */
export const measureTextWidth = (
  text: string,
  size: number,
  fontFamily = 'sans-serif',
  bold = true,
): number => {
  if (measureCtx === undefined) {
    measureCtx = document.createElement('canvas').getContext('2d');
  }
  if (!measureCtx) return text.length * size * 0.55;
  measureCtx.font = `${bold ? 'bold ' : ''}${size}px ${fontFamily}`;
  return measureCtx.measureText(text).width;
};

/** Largeur d'un titre (bold sans-serif) pour le word-wrap. */
const textWidth = (text: string, size: number): number =>
  measureTextWidth(text, size, 'sans-serif', true);

/** Découpe `text` en lignes qui tiennent dans `maxWidth` (coupes sur les espaces). */
export const wrapText = (text: string, maxWidth: number, size: number): string[] => {
  if (!text) return [''];
  if (maxWidth <= 0) return [text];

  const lines: string[] = [];
  let current = '';
  for (const word of text.split(/\s+/)) {
    const trial = current ? `${current} ${word}` : word;
    if (textWidth(trial, size) <= maxWidth) {
      current = trial;
      continue;
    }
    if (current) {
      lines.push(current);
      current = '';
    }
    // Mot seul plus long que la ligne : on le coupe caractère par caractère.
    if (textWidth(word, size) > maxWidth) {
      let chunk = '';
      for (const ch of word) {
        if (chunk && textWidth(chunk + ch, size) > maxWidth) {
          lines.push(chunk);
          chunk = ch;
        } else {
          chunk += ch;
        }
      }
      current = chunk;
    } else {
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [''];
};

export interface FreeTextMetrics {
  /** Taille de police finale (adaptée à la largeur si non imposée). */
  size: number;
  /** Largeur mesurée du texte (px écran). */
  width: number;
  /** Hauteur de ligne approximative (px écran). */
  height: number;
  fontFamily: string;
  bold: boolean;
  color: string;
}

/**
 * Métriques d'un texte libre : source unique pour le rendu canvas,
 * l'export SVG et le hit-test (sélection/drag).
 */
export const freeTextMetrics = (
  t: FreeText,
  canvasW: number,
  horizontal: boolean,
): FreeTextMetrics => {
  const sx = horizontal ? t.y : t.x;
  const maxW = Math.max(40, 2 * Math.min(sx, canvasW - sx) - 16);
  const size = t.fontSize ?? fitFontSize(t.text, maxW, DEFAULT_TEXT_SIZE, MIN_TEXT_SIZE);
  const fontFamily = t.fontFamily ?? 'sans-serif';
  const bold = t.bold !== false;
  const width = measureTextWidth(t.text, size, fontFamily, bold);
  return {
    size,
    width,
    height: size * 1.2,
    fontFamily,
    bold,
    color: t.color ?? '#ffffff',
  };
};
