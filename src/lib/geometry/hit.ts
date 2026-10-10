import type { FreeText } from '../types';
import { freeTextMetrics } from './text';

/** Id du texte situé sous le point logique (dernier rendu = dessus), ou null. */
export const hitTestText = (
  texts: FreeText[],
  x: number,
  y: number,
  canvasW: number,
  horizontal: boolean,
): string | null => {
  for (let i = texts.length - 1; i >= 0; i--) {
    const t = texts[i];
    const m = freeTextMetrics(t, canvasW, horizontal);
    if (Math.abs(x - t.x) <= m.width / 2 + 6 && Math.abs(y - t.y) <= m.height / 2 + 6) {
      return t.id;
    }
  }
  return null;
};
