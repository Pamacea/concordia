import { jsPDF } from 'jspdf';
import { diagramCanvasSize } from '../../lib/geometry';
import { useChordsStore } from '../../lib/store/chordsStore';
import type { Diagram, ExportFormat, ExportScope, Group, StyleSettings } from '../../lib/types';
import { createSVGString } from './createSVGString';
import { getTargetDiagramsForExport } from './targets';

interface ExecuteExportParams {
  format: ExportFormat;
  scope: ExportScope;
  groups: Group[];
  diagrams: Record<string, Diagram>;
  selectedGroupId: string;
  selectedIds: Set<string>;
  style: StyleSettings;
  pdfGrid: number;
}

const downloadObjectUrl = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = filename;
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
};

const diagramFileName = (diag: Diagram, ext: string): string =>
  `${diag.name.replace(/\s+/g, '_')}.${ext}`;

const svgToCanvas2x = (
  svgStr: string,
  bgColor: string,
  width: number,
  height: number,
): Promise<HTMLCanvasElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas 2D indisponible'));
        return;
      }
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });

const hexToRgb = (hex: string): [number, number, number] => {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return [28, 28, 30];
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const exportJSON = (groups: Group[], diagrams: Record<string, Diagram>): void => {
  const exportData = { version: '1.0', groups, diagrams };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  downloadObjectUrl(blob, 'concordia_export.json');
};

const exportSVG = (list: Diagram[], style: StyleSettings): void => {
  for (const diag of list) {
    const blob = new Blob([createSVGString(diag, style)], {
      type: 'image/svg+xml;charset=utf-8',
    });
    downloadObjectUrl(blob, diagramFileName(diag, 'svg'));
  }
};

const exportPNG = async (list: Diagram[], style: StyleSettings): Promise<void> => {
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

const PDF_LAYOUTS: Record<number, { cols: number; rows: number }> = {
  1: { cols: 1, rows: 1 },
  2: { cols: 1, rows: 2 },
  4: { cols: 2, rows: 2 },
  6: { cols: 2, rows: 3 },
  8: { cols: 2, rows: 4 },
  12: { cols: 3, rows: 4 },
};

const exportPDF = async (
  list: Diagram[],
  style: StyleSettings,
  pdfGrid: number,
): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const [r, g, b] = hexToRgb(style.diagramBgColor);
  pdf.setFillColor(r, g, b);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  const { cols, rows } = PDF_LAYOUTS[pdfGrid] ?? PDF_LAYOUTS[4];

  const padding = 10;
  const cellWidth = (pageWidth - padding * (cols + 1)) / cols;
  const cellHeight = (pageHeight - padding * (rows + 1)) / rows;
  const perPage = cols * rows;

  for (let i = 0; i < list.length; i++) {
    if (i > 0 && i % perPage === 0) {
      pdf.addPage();
      pdf.setFillColor(r, g, b);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    }

    const diag = list[i];
    const size = diagramCanvasSize(diag, style);
    const pageIdx = i % perPage;
    const colIdx = pageIdx % cols;
    const rowIdx = Math.floor(pageIdx / cols);

    const xPos = padding + colIdx * (cellWidth + padding);
    const yPos = padding + rowIdx * (cellHeight + padding);

    const canvas = await svgToCanvas2x(
      createSVGString(diag, style),
      style.diagramBgColor,
      size.width,
      size.height,
    );
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    const aspect = size.width / size.height;
    let drawW = cellWidth;
    let drawH = cellWidth / aspect;
    if (drawH > cellHeight) {
      drawH = cellHeight;
      drawW = cellHeight * aspect;
    }

    pdf.addImage(
      imgData,
      'JPEG',
      xPos + (cellWidth - drawW) / 2,
      yPos + (cellHeight - drawH) / 2,
      drawW,
      drawH,
    );
  }

  pdf.save(`Diagrammes_Accords_${pdfGrid}_par_page.pdf`);
};

/** Exécute l'export choisi et notifie le résultat (toast). */
export const executeExport = async (params: ExecuteExportParams): Promise<void> => {
  const { format, scope, groups, diagrams, selectedGroupId, selectedIds, style, pdfGrid } =
    params;
  const { showToast } = useChordsStore.getState();

  if (format === 'json') {
    exportJSON(groups, diagrams);
    showToast('Fichier JSON exporté avec succès !', 'success');
    return;
  }

  const list = getTargetDiagramsForExport(scope, groups, diagrams, selectedGroupId, selectedIds);
  if (list.length === 0) {
    showToast("Aucun diagramme sélectionné pour l'exportation.", 'error');
    return;
  }

  if (format === 'svg') {
    exportSVG(list, style);
    showToast('Exportation SVG terminée !', 'success');
  } else if (format === 'png') {
    await exportPNG(list, style);
    showToast('Exportation PNG terminée !', 'success');
  } else {
    await exportPDF(list, style, pdfGrid);
    showToast('Document PDF généré avec succès !', 'success');
  }
};
