import { diagramCanvasSize } from '../../lib/geometry';
import type { Diagram, StyleSettings } from '../../lib/types';
import { createSVGString } from './createSVGString';
import { diagramFileName, svgToCanvas2x } from './download';

/** Exporte chaque diagramme de la liste en PNG (rasterisation 2x). */
export const exportPNG = async (list: Diagram[], style: StyleSettings): Promise<void> => {
  for (const diag of list) {
    const size = diagramCanvasSize(diag, style);
    const canvas = await svgToCanvas2x(
      createSVGString(diag, style),
      style.diagramBgColor,
      size.width,
      size.height,
    );
    const a = document.createElement('a');
    a.download = diagramFileName(diag, 'png');
    a.href = canvas.toDataURL('image/png');
    a.click();
  }
};
