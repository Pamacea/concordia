import { jsPDF } from 'jspdf';
import { diagramCanvasSize } from '../../lib/geometry';
import type { Diagram, StyleSettings } from '../../lib/types';
import { createSVGString } from './createSVGString';
import { svgToCanvas2x } from './download';

const hexToRgb = (hex: string): [number, number, number] => {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return [28, 28, 30];
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

const PDF_LAYOUTS: Record<number, { cols: number; rows: number }> = {
  1: { cols: 1, rows: 1 },
  2: { cols: 1, rows: 2 },
  4: { cols: 2, rows: 2 },
  6: { cols: 2, rows: 3 },
  8: { cols: 2, rows: 4 },
  12: { cols: 3, rows: 4 },
};

/** Génère le PDF A4 (grille de diagrammes, fond couleur) et le télécharge. */
export const exportPDF = async (
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
