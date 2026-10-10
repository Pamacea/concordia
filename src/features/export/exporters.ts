import { useChordsStore } from '../../lib/store/chordsStore';
import type { Diagram, ExportFormat, ExportScope, Group, StyleSettings } from '../../lib/types';
import { downloadObjectUrl } from './download';
import { getTargetDiagramsForExport } from './targets';
import { exportPDF } from './pdf';
import { exportPNG } from './png';
import { exportSVG } from './svg';

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

/** Exporte groupes + diagrammes dans un fichier JSON unique. */
const exportJSON = (groups: Group[], diagrams: Record<string, Diagram>): void => {
  const exportData = { version: '1.0', groups, diagrams };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  downloadObjectUrl(blob, 'concordia_export.json');
};

/** Exécute l'export choisi et notifie le résultat (toast). */
export const executeExport = async (params: ExecuteExportParams): Promise<void> => {
  const { format, scope, groups, diagrams, selectedGroupId, selectedIds, style, pdfGrid } = params;
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
