import type { Diagram } from '../../lib/types';

/** Déclenche le téléchargement d'un blob via une URL objet éphémère. */
export const downloadObjectUrl = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = filename;
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
};

/** Nom de fichier d'un diagramme : espaces remplacés par des underscores. */
export const diagramFileName = (diag: Diagram, ext: string): string =>
  `${diag.name.replace(/\s+/g, '_')}.${ext}`;

/**
 * Rasterise une chaîne SVG sur un canvas (réticule 2x, fond opaque) —
 * partagé par les exports PNG et PDF.
 */
export const svgToCanvas2x = (
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
