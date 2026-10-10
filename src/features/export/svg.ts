import type { Diagram, StyleSettings } from '../../lib/types';
import { createSVGString } from './createSVGString';
import { diagramFileName, downloadObjectUrl } from './download';

/** Exporte chaque diagramme de la liste en fichier SVG. */
export const exportSVG = (list: Diagram[], style: StyleSettings): void => {
  for (const diag of list) {
    const blob = new Blob([createSVGString(diag, style)], {
      type: 'image/svg+xml;charset=utf-8',
    });
    downloadObjectUrl(blob, diagramFileName(diag, 'svg'));
  }
};
